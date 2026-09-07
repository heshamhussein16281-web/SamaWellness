import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block preview pages from external visitors
  // Allow access only from localhost, vercel preview, or with ?preview=1 param
  if (pathname.startsWith("/preview")) {
    const host = request.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const isVercelPreview = host.includes(".vercel.app");
    const hasPreviewParam = request.nextUrl.searchParams.has("preview");

    // On production domain without ?preview param, redirect to homepage
    if (!isLocal && !isVercelPreview && !hasPreviewParam) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // For allowed preview access, add noindex header
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/preview/:path*"],
};
