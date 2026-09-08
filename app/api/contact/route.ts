import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
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
