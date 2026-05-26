import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "info@samawellnesstherapy.com",
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

  return NextResponse.json({ success: true });
}
