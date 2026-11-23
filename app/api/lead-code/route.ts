import { NextResponse } from "next/server";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxNm36kxoTnyjXUEST1N98vesUTXagjAHuG59QsVWEGHPWUADhg86t9olXnmvBOVY46fQ/exec";
const FALLBACK_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomFallbackCode(source: string): string {
  let suffix = "";
  for (let i = 0; i < 3; i++) {
    suffix += FALLBACK_CHARS[Math.floor(Math.random() * FALLBACK_CHARS.length)];
  }
  return source + suffix;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const source = ["G", "S", "I", "D"].includes(body?.source) ? body.source : "D";
  const gclid = typeof body?.gclid === "string" ? body.gclid : null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getNextCode", source, gclid }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error("Apps Script returned non-200");
    const data = await res.json();
    if (typeof data?.code === "string" && data.code.length > 0) {
      return NextResponse.json({ code: data.code });
    }
    throw new Error("Apps Script response missing code");
  } catch (err) {
    console.error("lead-code: Apps Script counter failed, using fallback:", err);
    return NextResponse.json({ code: randomFallbackCode(source) });
  }
}
