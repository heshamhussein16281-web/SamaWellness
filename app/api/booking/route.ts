import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validatePhone } from "@/lib/phone";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxNm36kxoTnyjXUEST1N98vesUTXagjAHuG59QsVWEGHPWUADhg86t9olXnmvBOVY46fQ/exec";

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (9 AM – 12 PM)",
  afternoon: "Afternoon (12 – 5 PM)",
  evening: "Evening (5 – 9 PM)",
};

const DUPLICATE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, preferred_time, session_format, note, source, lead_source } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  // Action 13: reject wrong-length / malformed numbers server-side so a bad
  // lead can never be saved, even if the client-side check was bypassed
  // (direct API call, stale cached JS, etc). Normalizes to "01xxxxxxxxx"
  // for Egypt or "+<countrycode>…" for international — this becomes the
  // canonical stored + deduped value, same shape the old ad-hoc
  // normalizePhone() used to produce for Egyptian numbers.
  const phoneCheck = validatePhone(phone);
  if (!phoneCheck.valid) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  const normalizedPhone = phoneCheck.normalized;

  // NOTE: lead_source ("google_ads" / "direct") is NOT written to Supabase below —
  // the contact_submissions table has no lead_source column. It's only forwarded
  // to the Google Sheet (schema-less JSON) so reception can see it there. Adding
  // it to Supabase would need a migration (see Action 6 summary) — ask first.

  // Store in Supabase. Use the service-role key (server-only, same pattern as
  // the admin API routes) so the duplicate-lookup SELECT below isn't blocked
  // by the RLS policy that restricts SELECT to authenticated users — the
  // anon key can insert but can't read, which would make the dedupe check
  // silently return zero rows.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Server-side duplicate protection: catches the same phone number
  // submitting again from another device/browser/private window/cleared
  // storage, which the client-only localStorage check can't see. Compare
  // normalized values in JS (rather than an exact DB match) so it still
  // catches older rows whose last_name was stored unnormalized.
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data: recentRows, error: lookupError } = await supabase
    .from("contact_submissions")
    .select("last_name")
    .gte("created_at", since);

  if (lookupError) {
    console.error("Supabase duplicate lookup error:", lookupError);
    // Fail open on the lookup (don't block a legitimate booking because the
    // duplicate check itself errored) — proceed to insert as normal below.
  } else if (recentRows?.some((row) => validatePhone(row.last_name || "").normalized === normalizedPhone)) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  // Map booking fields to existing contact_submissions columns:
  // first_name ← name, last_name ← normalized phone, email ← phone (for lookup),
  // topic ← source + preferred time, message ← note
  const timeLabel = preferred_time ? ` | ${TIME_LABELS[preferred_time] || preferred_time}` : "";
  const formatLabel = session_format && session_format !== "either" ? ` | ${session_format === "online" ? "Online" : "In-Person"}` : "";
  const topicStr = `Booking Request${timeLabel}${formatLabel}`;
  const { error: dbError } = await supabase.from("contact_submissions").insert([
    {
      first_name: name,
      last_name: normalizedPhone,
      email: `${source || "booking_modal"}@booking`,
      topic: topicStr,
      message: note || `Assessment booking request. Phone: ${normalizedPhone}`,
    },
  ]);

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Push to Google Sheet
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: normalizedPhone,
        preferred_time: preferred_time ? (TIME_LABELS[preferred_time] || preferred_time) : "",
        session_format: session_format || "either",
        note: note || "",
        source: source || "booking_modal",
        lead_source: lead_source || "direct",
      }),
    });
  } catch (sheetError) {
    console.error("Google Sheet push failed:", sheetError);
    // Don't fail the request — data is already saved in Supabase
  }

  return NextResponse.json({ success: true });
}
