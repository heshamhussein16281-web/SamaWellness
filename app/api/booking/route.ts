import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmailNotification } from "@/lib/email";

const NOTIFICATION_EMAIL = "samawellnesstherapy@gmail.com";
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

  // Send email notification
  const isArabic = source === "booking_modal_ar";
  const timeDisplay = preferred_time ? (TIME_LABELS[preferred_time] || preferred_time) : "No preference";

  try {
    await sendEmailNotification({
      to: NOTIFICATION_EMAIL,
      subject: `🟢 New Assessment Booking Request — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7b2d3e; margin-bottom: 4px;">New Assessment Booking Request</h2>
          <p style="color: #999; font-size: 13px; margin-top: 0;">
            From the ${isArabic ? "Arabic" : "English"} website • ${new Date().toLocaleString("en-EG", { timeZone: "Africa/Cairo" })}
          </p>

          <div style="background: #f5f2ee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7b2d3e;">
            <p style="margin: 0 0 12px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 12px;"><strong>Phone / WhatsApp:</strong> <a href="https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, "")}" style="color: #7b2d3e;">${phone}</a></p>
            <p style="margin: 0 0 12px;"><strong>Preferred Time:</strong> ${timeDisplay}</p>
            ${note ? `<p style="margin: 0;"><strong>Note:</strong> ${note}</p>` : ""}
          </div>

          <p style="margin: 20px 0;">
            <a href="https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hi ${name}, this is Sama Wellness Therapy. We received your assessment booking request — when would be a good time to call?`)}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reply on WhatsApp →
            </a>
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from the Sama Wellness website booking form.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email send failed:", emailError);
    // Don't fail the request — data is already saved in Supabase
  }

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
