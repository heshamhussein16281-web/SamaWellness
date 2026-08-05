import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmailNotification } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapist_id, therapist_name, full_name, mobile, email } = body;

    if (!therapist_id || !therapist_name || !full_name || !mobile) {
      return NextResponse.json(
        { error: "Missing required fields: therapist, full name, and mobile number" },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabase
      .from("booking_requests")
      .insert([
        {
          therapist_id,
          therapist_name,
          full_name,
          mobile,
          email: email || null,
          created_at: new Date().toISOString(),
        },
      ]);

    if (dbError) throw dbError;

    try {
      const emailHtml = `
        <h2>New Booking Request</h2>
        <p><strong>Therapist:</strong> ${therapist_name}</p>
        <p><strong>Client Name:</strong> ${full_name}</p>
        <p><strong>Mobile Number:</strong> ${mobile}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <hr>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `;

      await sendEmailNotification({
        subject: `New Booking Request for ${therapist_name}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error processing booking request:", error);
    return NextResponse.json(
      { error: "Failed to process your booking request. Please try again." },
      { status: 500 }
    );
  }
}
