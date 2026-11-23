import { NextResponse } from "next/server";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxNm36kxoTnyjXUEST1N98vesUTXagjAHuG59QsVWEGHPWUADhg86t9olXnmvBOVY46fQ/exec";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { code, source, gclid, pageLanguage, landingPage, channel, name, phone } = body || {};

  if (!code || !channel) {
    return NextResponse.json({ error: "Missing code or channel" }, { status: 400 });
  }

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logLead",
        code,
        source: source || "D",
        gclid: gclid || "",
        pageLanguage: pageLanguage || "en",
        landingPage: landingPage || "",
        channel,
        name: name || "",
        phone: phone || "",
      }),
    });
  } catch (err) {
    console.error("lead-log: Apps Script logging failed:", err);
  }

  return NextResponse.json({ success: true });
}
