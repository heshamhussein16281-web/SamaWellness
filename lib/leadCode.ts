/* Readable lead reference codes (e.g. "G104") + booking tracking.
   One code per visitor, reused for 30 days across WhatsApp, the booking
   form, and phone-call clicks, so reception can see the source at a
   glance and Google Ads offline conversions can be matched back later.

   Source detection happens once, on first touch, using the SAME
   gclid/gbraid/wbraid URL params lib/sourceTag.ts already keys off of —
   this module doesn't replace that capture, it does its own identical,
   synchronous read of the URL (no dependency ordering needed between
   the two modules).

   Timing design (see Action 25 plan + approval notes):
   - The real, sequential code is fetched in the BACKGROUND, kicked off
     once the browser goes idle after page load (not on every mount) —
     this avoids burning a sequential number on the fastest bounces.
   - WhatsApp links must open instantly with a plain <a href> — no await
     in the click handler, or mobile popup blockers will block the tab.
     So: if the real code has already resolved by click time, the href
     already has it (updated via a background promise). If not, the
     click handler commits a random fallback SYNCHRONOUSLY (no network
     call) and that becomes this visitor's permanent code.
   - Whichever code is committed first (real fetch or click-time
     fallback) wins — once committed, it is never silently overwritten,
     so the same code is guaranteed to show up on WhatsApp, the booking
     form's success screen, and in "Leads log" for one visitor.
   - A "Leads log" row is only ever written on an actual WhatsApp click,
     form submit, or call click — never on page load. */

const STORAGE_KEY = "sama_lead_code";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid"];
const FETCH_TIMEOUT_MS = 2500;
const FALLBACK_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/l

export type LeadSource = "G" | "S" | "I" | "D";

export interface LeadCodeInfo {
  code: string;
  source: LeadSource;
  gclid: string | null;
  landingPage: string;
}

interface StoredLeadCode extends LeadCodeInfo {
  ts: number;
}

// In-memory cache for the current page session. Avoids re-reading
// localStorage on every call and is the single source of truth for
// "has a code already been committed this session" (write-once).
let committed: LeadCodeInfo | null = null;
let fetchStarted = false;

function readStored(): StoredLeadCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.code !== "string" ||
      typeof parsed?.ts !== "number" ||
      !["G", "S", "I", "D"].includes(parsed?.source)
    ) {
      return null;
    }
    if (Date.now() - parsed.ts > THIRTY_DAYS_MS) return null;
    return parsed as StoredLeadCode;
  } catch {
    return null;
  }
}

function writeStored(info: LeadCodeInfo): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...info, ts: Date.now() })
    );
  } catch {
    // localStorage unavailable — the code still works for this page
    // view via the in-memory `committed` value, it just won't persist
    // across a reload.
  }
}

/** First-touch source detection. Only meaningful on the FIRST page view
 *  of a session — document.referrer is empty/internal on later internal
 *  navigations, exactly like the existing gclid capture in sourceTag.ts. */
function detectSource(): { source: LeadSource; gclid: string | null } {
  if (typeof window === "undefined") return { source: "D", gclid: null };
  try {
    const params = new URLSearchParams(window.location.search);
    for (const p of CLICK_ID_PARAMS) {
      if (params.has(p)) {
        return { source: "G", gclid: params.get(p) };
      }
    }
    const ref = document.referrer.toLowerCase();
    const utmSource = (params.get("utm_source") || "").toLowerCase();
    if (ref.includes("google.") && !ref.includes("samawellnesstherapy.com")) {
      return { source: "S", gclid: null };
    }
    if (
      ref.includes("instagram.com") ||
      ref.includes("l.instagram.com") ||
      utmSource === "instagram"
    ) {
      return { source: "I", gclid: null };
    }
    return { source: "D", gclid: null };
  } catch {
    return { source: "D", gclid: null };
  }
}

function randomFallbackCode(source: LeadSource): string {
  let suffix = "";
  for (let i = 0; i < 3; i++) {
    suffix += FALLBACK_CHARS[Math.floor(Math.random() * FALLBACK_CHARS.length)];
  }
  return source + suffix;
}

function commit(info: LeadCodeInfo): LeadCodeInfo {
  // Write-once: if something was already committed (e.g. a click-time
  // fallback fired before this background fetch resolved), keep it.
  if (committed) return committed;
  committed = info;
  writeStored(info);
  return committed;
}

async function fetchRealCode(source: LeadSource, gclid: string | null): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/lead-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, gclid }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.code === "string" && data.code.length > 0 ? data.code : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/** Kicks off the background fetch for a real, sequential code. Safe to
 *  call multiple times — only the first call actually starts a fetch.
 *  Does nothing if a code (real or fallback) is already committed, or
 *  one was already cached from a previous page view this visit. */
export function ensureLeadCodeStarted(): void {
  if (typeof window === "undefined" || fetchStarted) return;
  const existing = readStored();
  if (existing) {
    committed = { code: existing.code, source: existing.source, gclid: existing.gclid, landingPage: existing.landingPage };
    return;
  }
  fetchStarted = true;
  const { source, gclid } = detectSource();
  const landingPage = window.location.pathname;
  fetchRealCode(source, gclid).then((code) => {
    if (committed) return; // a click-time fallback already won
    commit({ code: code || randomFallbackCode(source), source, gclid, landingPage });
  });
}

/** Schedules ensureLeadCodeStarted() for when the browser is idle,
 *  rather than firing it immediately on mount — avoids reserving a
 *  sequential number for the fastest bounces. Falls back to a short
 *  timeout on browsers without requestIdleCallback (Safari). */
export function scheduleLeadCodeFetch(): void {
  if (typeof window === "undefined") return;
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback;
  if (typeof ric === "function") {
    ric(() => ensureLeadCodeStarted(), { timeout: 2000 });
  } else {
    setTimeout(ensureLeadCodeStarted, 1200);
  }
}

/** Synchronous read of whatever code is currently committed — from this
 *  page view's background fetch, or a previous page view this visit.
 *  Returns null if nothing has resolved yet (background fetch still
 *  pending and nothing cached from before). Never makes a network call. */
export function getResolvedLeadCode(): LeadCodeInfo | null {
  if (committed) return committed;
  const existing = readStored();
  if (existing) {
    committed = { code: existing.code, source: existing.source, gclid: existing.gclid, landingPage: existing.landingPage };
    return committed;
  }
  return null;
}

/** Synchronous, no network call. Use ONLY at the moment of an action
 *  that must not be delayed (a WhatsApp link's onClick) when
 *  getResolvedLeadCode() returned null. Generates and permanently
 *  commits a random fallback code for this visitor. */
export function commitFallbackNow(): LeadCodeInfo {
  const resolved = getResolvedLeadCode();
  if (resolved) return resolved;
  const { source, gclid } = detectSource();
  const landingPage = typeof window !== "undefined" ? window.location.pathname : "/";
  return commit({ code: randomFallbackCode(source), source, gclid, landingPage });
}

/** Async — waits for the real code if the background fetch is already
 *  in flight, otherwise resolves immediately with whatever's committed
 *  or a fresh fallback. Safe to await: use this for the booking form
 *  (already asynchronous) and call-click logging (sendBeacon, not
 *  popup-blocker sensitive) — NEVER for a WhatsApp <a> click handler. */
export async function getOrCreateLeadCode(): Promise<LeadCodeInfo> {
  const resolved = getResolvedLeadCode();
  if (resolved) return resolved;
  ensureLeadCodeStarted();
  // Give the just-started (or already in-flight) fetch a short window
  // to resolve before falling back, since this call site can afford to wait.
  const start = Date.now();
  while (!committed && Date.now() - start < FETCH_TIMEOUT_MS + 200) {
    await new Promise((r) => setTimeout(r, 50));
  }
  return committed || commitFallbackNow();
}

/** Appends the lead code to an already percent-encoded WhatsApp text
 *  string, e.g. "I%27d%20like..." -> "I%27d%20like...%20G104".
 *  Replaces the old appendSourceSuffix() " ·G" marker. Resolves
 *  immediately if a code is already committed; otherwise waits like
 *  getOrCreateLeadCode() — use this for setting an href in a useEffect,
 *  NOT inside a click handler. */
export async function appendLeadCode(encodedText: string): Promise<string> {
  const { code } = await getOrCreateLeadCode();
  return `${encodedText}%20${code}`;
}

/** Synchronous version for use in a WhatsApp link's onClick handler:
 *  returns the already-resolved code, or commits+returns a fallback
 *  immediately if nothing has resolved yet. Never awaits. */
export function appendLeadCodeSync(encodedText: string): string {
  const info = getResolvedLeadCode() || commitFallbackNow();
  return `${encodedText}%20${info.code}`;
}

export function pageLanguage(): "ar" | "en" {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.startsWith("/ar") ? "ar" : "en";
}

/** Fire-and-forget: logs a lead action (WhatsApp click or call click) to
 *  the "Leads log" sheet via sendBeacon, which doesn't block or delay
 *  whatever navigation the click already triggered (tel:, WhatsApp tab).
 *  Uses whatever code is already resolved; commits a fallback
 *  synchronously first if nothing has resolved yet. */
export function logLeadClick(channel: "whatsapp" | "call", info?: LeadCodeInfo): void {
  const resolved = info || getResolvedLeadCode() || commitFallbackNow();
  try {
    navigator.sendBeacon(
      "/api/lead-log",
      new Blob(
        [JSON.stringify({
          code: resolved.code,
          source: resolved.source,
          gclid: resolved.gclid,
          pageLanguage: pageLanguage(),
          landingPage: resolved.landingPage,
          channel,
        })],
        { type: "application/json" }
      )
    );
  } catch {
    // sendBeacon unavailable/failed — nothing to recover, this is
    // best-effort logging only.
  }
}
