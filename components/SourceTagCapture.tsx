"use client";
import { useEffect } from "react";
import { captureAdsClickId } from "@/lib/sourceTag";
import { scheduleLeadCodeFetch } from "@/lib/leadCode";

/* Mounted once per public layout (EN + AR). Captures a Google Ads click ID
   (gclid/gbraid/wbraid), if present in the URL, into localStorage so
   WhatsApp links and the booking form can be tagged later in the visit.
   Also schedules the Action 25 lead reference code fetch for when the
   browser goes idle (not immediately) — see lib/leadCode.ts for why.
   Renders nothing. */
export default function SourceTagCapture() {
  useEffect(() => {
    captureAdsClickId();
    scheduleLeadCodeFetch();
  }, []);

  return null;
}
