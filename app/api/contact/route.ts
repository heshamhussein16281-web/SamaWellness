import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const body = await req.json();
  const { first_name, last_name, email, topic, message } = body;

  if (!email || !topic || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("contact_submissions").insert([
    { first_name, last_name, email, topic, message },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Sama Wellness Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    subject: `New Contact Form Submission — ${topic}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td><strong>Name</strong></td><td>${first_name ?? ""} ${last_name ?? ""}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Topic</strong></td><td>${topic}</td></tr>
        <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap;">${message}</td></tr>
      </table>
    `,
  });

  return NextResponse.json({ success: true });
}
