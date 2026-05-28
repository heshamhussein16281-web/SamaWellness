import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    const checks: Record<string, string> = {
      supabaseUrl: supabaseUrl ? "✓ Set" : "✗ Missing",
      supabaseAnonKey: supabaseAnonKey ? "✓ Set" : "✗ Missing",
      resendKey: resendKey ? "✓ Set" : "✗ Missing",
    };

    // Try to connect to Supabase
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id")
        .limit(1);

      checks.supabaseConnection = error
        ? `✗ Connection failed: ${error.message}`
        : "✓ Connection successful";
    }

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
