import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmailNotification } from "@/lib/email";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxNm36kxoTnyjXUEST1N98vesUTXagjAHuG59QsVWEGHPWUADhg86t9olXnmvBOVY46fQ/exec";

export async function POST(req: Request) {
  const body = await req.json();
  const { first_name, last_name, email, topic, message } = body;

  if (!email || !topic || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Store in Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error: dbError } = await supabase.from("contact_submissions").insert([
    { first_name, last_name, email, topic, message },
  ]);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Send email notification
  try {
    await sendEmailNotification({
      subject: `New Contact Form Submission - ${topic}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2d4a46;">New Contact Form Submission</h2>

          <div style="background: #f5f2ee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated notification from your Sama Wellness website contact form.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Email send failed:", emailError);
    // Don't fail the request if email fails - data is still in Supabase
  }

  // Push to Google Sheet
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${first_name} ${last_name}`, phone: email, preferred_time: topic, note: message, source: "contact_form" }),
    });
  } catch (sheetError) {
    console.error("Google Sheet push failed:", sheetError);
  }

  return NextResponse.json({ success: true });
}
