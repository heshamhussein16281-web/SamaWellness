/* Google Ads click-ID capture & WhatsApp/booking source tagging.
   Lets reception see which leads originated from a Google Ads click,
   without relying on Google's own ad-platform reporting. */

const STORAGE_KEY = "sama_src";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"];

// Percent-encoded " ·G" (space + middle dot U+00B7 + G), appended to the
// WhatsApp pre-filled text so reception can spot Google Ads leads at a glance.
const WHATSAPP_SOURCE_SUFFIX = "%20%C2%B7G";

interface StoredSource {
  src: "g";
  ts: number;
}

function readStoredSource(): StoredSource | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.src !== "g" || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > THIRTY_DAYS_MS) return null;
    return parsed as StoredSource;
  } catch {
    return null;
  }
}

/** Call once on page load. If the URL carries a Google Ads click ID
 *  (gclid/gbraid/wbraid), remember it for 30 days so later WhatsApp
 *  clicks and booking submissions can be tagged. No-ops silently if
 *  localStorage is unavailable (private mode, blocked, etc.). */
export function captureAdsClickId(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const hasClickId = CLICK_ID_PARAMS.some((param) => params.has(param));
    if (hasClickId) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ src: "g", ts: Date.now() })
      );
    }
  } catch {
    // localStorage unavailable — no-op
  }
}

/** True if this visitor arrived via a (still-valid, <=30 days) Google Ads click. */
function isFromGoogleAds(): boolean {
  return readStoredSource() !== null;
}

/** Appends the percent-encoded " ·G" marker to an already percent-encoded
 *  WhatsApp pre-filled text string when the visitor came from Google Ads.
 *  Leaves the text unchanged otherwise. */
export function appendSourceSuffix(encodedText: string): string {
  return isFromGoogleAds() ? encodedText + WHATSAPP_SOURCE_SUFFIX : encodedText;
}

/** Source label for the booking form's lead_source field. */
export function getLeadSource(): "google_ads" | "direct" {
  return isFromGoogleAds() ? "google_ads" : "direct";
}
