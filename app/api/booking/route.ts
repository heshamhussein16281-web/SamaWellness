import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxNm36kxoTnyjXUEST1N98vesUTXagjAHuG59QsVWEGHPWUADhg86t9olXnmvBOVY46fQ/exec";

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (9 AM – 12 PM)",
  afternoon: "Afternoon (12 – 5 PM)",
  evening: "Evening (5 – 9 PM)",
};

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, preferred_time, note, source } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  // Store in Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Map booking fields to existing contact_submissions columns:
  // first_name ← name, last_name ← phone, email ← phone (for lookup),
  // topic ← source + preferred time, message ← note
  const topicStr = `Booking Request${preferred_time ? ` (${TIME_LABELS[preferred_time] || preferred_time})` : ""}`;
  const { error: dbError } = await supabase.from("contact_submissions").insert([
    {
      first_name: name,
      last_name: phone,
      email: `${source || "booking_modal"}@booking`,
      topic: topicStr,
      message: note || `Assessment booking request. Phone: ${phone}`,
    },
  ]);

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const timeDisplay = preferred_time ? (TIME_LABELS[preferred_time] || preferred_time) : "No preference";

  // Push to Google Sheet
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, preferred_time: timeDisplay, note: note || "", source: source || "booking_modal" }),
    });
  } catch (sheetError) {
    console.error("Google Sheet push failed:", sheetError);
    // Don't fail the request — data is already saved in Supabase
  }

  return NextResponse.json({ success: true });
}
