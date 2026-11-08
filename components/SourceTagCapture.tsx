"use client";
import { useEffect } from "react";
import { captureAdsClickId } from "@/lib/sourceTag";

/* Mounted once per public layout (EN + AR). Captures a Google Ads click ID
   (gclid/gbraid/wbraid), if present in the URL, into localStorage so
   WhatsApp links and the booking form can be tagged later in the visit.
   Renders nothing. */
export default function SourceTagCapture() {
  useEffect(() => {
    captureAdsClickId();
  }, []);

  return null;
}
