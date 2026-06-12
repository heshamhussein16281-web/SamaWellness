import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, topic, question } = body;

    // Validation
    if (!email || !topic || !question) {
      return NextResponse.json(
        { error: "Missing required fields: email, topic, and question" },
        { status: 400 }
      );
    }

    // Store in Supabase
    const { error: dbError } = await supabase
      .from("counselor_questions")
      .insert([
        {
          name: name || null,
          email,
          topic,
          question,
          created_at: new Date().toISOString(),
        },
      ]);

    if (dbError) throw dbError;

    // Send email
    const emailHtml = `
      <h2>New Question Submission from Ask Counselor Sama</h2>
      <p><strong>From:</strong> ${name || "Anonymous"} (${email})</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Question:</strong></p>
      <p>${question.replace(/\n/g, "<br>")}</p>
      <hr>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: "info@samawellnesstherapy.com",
      subject: `New Question from ${name || "Anonymous"}: ${topic}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error processing question:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
