# Action 25 — Lead Reference Codes & Booking Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every lead (WhatsApp click, booking form, phone call) gets a short readable reference code like `G104` — prefix by source, single global sequential number — so reception can see the source at a glance and so Google Ads offline conversions can later be matched back to real bookings.

**Architecture:** A new client-side module (`lib/leadCode.ts`) detects the visitor's source on first touch (reusing the existing gclid/gbraid/wbraid capture), asks a new Next.js API route for the next sequence number (which proxies to a new `getNextCode` action added to the existing Google Apps Script web app, backed by a `LockService`-guarded counter cell so concurrent requests don't collide), and caches the resulting code in `localStorage` for 30 days — the same pattern `lib/sourceTag.ts` already uses for `sama_src`. The code replaces the old `" ·G"` WhatsApp suffix, appears on the booking form's success message, and is logged (new `logLead` Apps Script action) to a new "Leads log" sheet tab for every WhatsApp click, form submission, and phone-call click. A sheet-formula "Ads upload" tab filters that log to the rows Google Ads needs.

**Tech Stack:** Next.js 14 App Router, TypeScript, the existing Google Apps Script web app (hosted outside this repo, reachable only via its `/exec` webhook URL), `localStorage`, `navigator.sendBeacon`.

## Global Constraints

- No visual changes except: the reference code at the end of the WhatsApp pre-filled text (replacing `" ·G"`), and the new line on the booking form's success message. Everything else pixel-identical.
- Do not break current GA4 events, Google Ads conversion tags, or `·G`/gclid detection while this is being built — the underlying `sama_src` capture mechanism (gclid/gbraid/wbraid → `localStorage`) is reused, not replaced, by the new module.
- If the counter call fails for any reason (network error, Apps Script error, timeout), the lead must never be blocked — fall back immediately to `prefix + 3 random characters` and treat that as the lead's permanent code for its 30-day window.
- One code per visitor, reused across WhatsApp, form, and calls, for 30 days — exactly mirroring the existing `sama_src` 30-day pattern.
- No new pages. No new paid infrastructure (no KV database to provision) — the counter and all logging live in the Google Sheet the project already pushes to.
- Arabic text in WhatsApp messages must stay right-to-left; the code is appended as plain text at the very end (same position the old `" ·G"` suffix already used, so this is a proven-safe pattern, not a new one).
- Deploy to a Vercel preview only. Do not merge to production until explicitly approved in chat.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/leadCode.ts` (new) | Source detection (G/S/I/D), code fetch + 30-day cache, fallback generation, the `appendLeadCode()` helper that replaces `appendSourceSuffix()` |
| `app/api/lead-code/route.ts` (new) | Proxies `{source, gclid}` to the Apps Script `getNextCode` action; returns a fallback code itself if that call fails, so the client never has to guess the prefix logic twice |
| `app/api/lead-log/route.ts` (new) | Proxies a lead-log row (`logLead` action) to the Apps Script; used by client-side `sendBeacon` calls (WhatsApp, call clicks) |
| `app/api/booking/route.ts` (modify) | Accepts `code` from the client, forwards a `logLead` row server-side (channel `form`), in addition to existing behavior |
| `app/api/contact/route.ts` (modify) | Same, for the contact form |
| `components/SourceTagCapture.tsx` (modify) | Also ensures a lead code exists on first mount (fire-and-forget, doesn't block anything) |
| `components/BookingModal.tsx`, `components/ar/BookingModalAr.tsx` (modify) | Use `appendLeadCode()` instead of `appendSourceSuffix()`; send `code` in the POST body; show the code on the success screen |
| `components/MidCTA.tsx`, `components/ar/MidCTAAr.tsx` (modify) | Use `appendLeadCode()` instead of `appendSourceSuffix()` |
| `components/ContactButton.tsx`, `components/ar/ContactButtonAr.tsx` (modify) | Use `appendLeadCode()`; log a `whatsapp` row via `sendBeacon` on click |
| `components/Footer.tsx`, `components/ar/FooterAr.tsx`, `components/ContactInfo.tsx` (modify) | Log a `call` row via `sendBeacon` on the `tel:` link's click (last one needs `"use client"` added — it's currently a plain server component) |
| `docs/google-apps-script/leads-webapp-additions.gs` (new, repo reference only — not auto-deployed) | The exact code the user pastes into their existing Apps Script project |

---

### Task 1: `lib/leadCode.ts` — source detection, code fetch, 30-day cache, fallback

**Files:**
- Create: `lib/leadCode.ts`

**Interfaces:**
- Produces: `export async function getOrCreateLeadCode(): Promise<LeadCodeInfo>` where `LeadCodeInfo = { code: string; source: "G"|"S"|"I"|"D"; gclid: string | null; landingPage: string }`
- Produces: `export async function appendLeadCode(encodedText: string): Promise<string>` — percent-encoded WhatsApp text in, same text + `%20<code>` out
- Produces: `export function pageLanguage(): "ar" | "en"` — reads `window.location.pathname`
- Consumes: nothing from other tasks (this is the foundation module)

- [ ] **Step 1: Write the module**

```typescript
// lib/leadCode.ts
/* Readable lead reference codes (e.g. "G104") + booking tracking.
   One code per visitor, reused for 30 days across WhatsApp, the booking
   form, and phone-call clicks, so reception can see the source at a
   glance and Google Ads offline conversions can be matched back later.

   Source detection happens once, on first touch, using the SAME 30-day
   gclid/gbraid/wbraid capture lib/sourceTag.ts already performs — this
   module doesn't replace that capture, it reads the result of it. */

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
    // localStorage unavailable — the code just won't persist; caller
    // already has it in memory for this page view.
  }
}

/** First-touch source detection. Must only be trusted on the FIRST page
 *  view of a session — document.referrer is empty/internal on later
 *  internal navigations, exactly like the existing gclid capture. */
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

async function fetchNextCode(source: LeadSource, gclid: string | null): Promise<string> {
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
    if (!res.ok) return randomFallbackCode(source);
    const data = await res.json();
    if (typeof data?.code === "string" && data.code.length > 0) {
      return data.code;
    }
    return randomFallbackCode(source);
  } catch {
    clearTimeout(timer);
    return randomFallbackCode(source);
  }
}

let inFlight: Promise<LeadCodeInfo> | null = null;

/** Returns this visitor's lead code, creating and caching one (30 days)
 *  on first call. Safe to call from many components at once — concurrent
 *  calls before the first one resolves share the same in-flight promise
 *  instead of each requesting their own code. */
export async function getOrCreateLeadCode(): Promise<LeadCodeInfo> {
  const existing = readStored();
  if (existing) {
    return {
      code: existing.code,
      source: existing.source,
      gclid: existing.gclid,
      landingPage: existing.landingPage,
    };
  }
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { source, gclid } = detectSource();
    const landingPage = typeof window !== "undefined" ? window.location.pathname : "/";
    const code = await fetchNextCode(source, gclid);
    const info: LeadCodeInfo = { code, source, gclid, landingPage };
    writeStored(info);
    inFlight = null;
    return info;
  })();

  return inFlight;
}

/** Appends the lead code to an already percent-encoded WhatsApp text
 *  string, e.g. "I%27d%20like..." -> "I%27d%20like...%20G104".
 *  Replaces the old appendSourceSuffix() " ·G" marker. */
export async function appendLeadCode(encodedText: string): Promise<string> {
  const { code } = await getOrCreateLeadCode();
  return `${encodedText}%20${code}`;
}

export function pageLanguage(): "ar" | "en" {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.startsWith("/ar") ? "ar" : "en";
}
```

- [ ] **Step 2: Manual verification (no test framework in this project — matches how prior Actions 21-24 were verified)**

Start the dev server (`preview_start` with the `dev` launch config), open the browser console on `http://localhost:3000/?gclid=test123`, and run:

```js
const { getOrCreateLeadCode } = await import('/lib/leadCode.ts'); // won't resolve directly in browser — instead:
```

Since this is a server-rendered app, verify instead by temporarily adding `console.log(await getOrCreateLeadCode())` inside `SourceTagCapture.tsx`'s `useEffect` (Task 10 will do this permanently via the real integration) and checking the browser console shows `{ code: "G...", source: "G", gclid: "test123", landingPage: "/" }`. Remove the temporary log once Task 10 is in place.

- [ ] **Step 3: Commit**

```bash
git add lib/leadCode.ts
git commit -m "Action 25: add lib/leadCode.ts for readable lead reference codes"
```

---

### Task 2: `app/api/lead-code/route.ts` — counter proxy

**Files:**
- Create: `app/api/lead-code/route.ts`

**Interfaces:**
- Consumes: nothing from this repo (calls the external Apps Script URL)
- Produces: `POST` endpoint accepting `{source: "G"|"S"|"I"|"D", gclid: string|null}`, returning `{code: string}` with HTTP 200 always (never a 500 that would force the client to guess fallback logic itself — this route absorbs the Apps Script failure case too)

- [ ] **Step 1: Write the route**

```typescript
// app/api/lead-code/route.ts
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
    const timer = setTimeout(() => controller.abort(), 4000);
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
```

- [ ] **Step 2: Manual verification**

```bash
curl -s -X POST http://localhost:3000/api/lead-code \
  -H "Content-Type: application/json" \
  -d '{"source":"G","gclid":"test123"}'
```

Expected (once Task 4's Apps Script addition is deployed): `{"code":"G104"}` (or whatever the next number is). Before Task 4 is deployed, expected: `{"code":"GXXX"}` with 3 random letters/digits — confirms the fallback path works even with no Apps Script support yet.

- [ ] **Step 3: Commit**

```bash
git add app/api/lead-code/route.ts
git commit -m "Action 25: add /api/lead-code proxy with built-in fallback"
```

---

### Task 3: `app/api/lead-log/route.ts` — logging proxy

**Files:**
- Create: `app/api/lead-log/route.ts`

**Interfaces:**
- Produces: `POST` endpoint accepting `{code, source, gclid, pageLanguage, landingPage, channel, name?, phone?}`, always returns `{success: true}` (logging failures must never surface as errors to the caller — a `sendBeacon` call has no error handling on the client side anyway)

- [ ] **Step 1: Write the route**

```typescript
// app/api/lead-log/route.ts
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
```

- [ ] **Step 2: Manual verification**

```bash
curl -s -X POST http://localhost:3000/api/lead-log \
  -H "Content-Type: application/json" \
  -d '{"code":"G104","source":"G","gclid":"test123","pageLanguage":"en","landingPage":"/","channel":"whatsapp"}'
```

Expected: `{"success":true}`, and (once Task 4 is deployed) a new row in the "Leads log" tab.

- [ ] **Step 3: Commit**

```bash
git add app/api/lead-log/route.ts
git commit -m "Action 25: add /api/lead-log proxy for lead tracking"
```

---

### Task 4: Google Apps Script additions (deliverable for the user to paste in)

**Files:**
- Create: `docs/google-apps-script/leads-webapp-additions.gs` (reference copy in the repo; the actual deployment happens in the user's Apps Script editor, which this repo has no access to)

**Interfaces:**
- Consumes: the `{action: "getNextCode", source, gclid}` and `{action: "logLead", ...}` request shapes from Tasks 2 and 3
- Produces: `{code: "G104"}` JSON response for `getNextCode`; no required response shape for `logLead` (fire-and-forget)

- [ ] **Step 1: Write the additions file**

See [docs/google-apps-script/leads-webapp-additions.gs](../../google-apps-script/leads-webapp-additions.gs) for the current, complete file — it's kept there as the single source of truth rather than duplicated here. It has three tabs now (`Counters`, `Leads log` — fully automatic — and `Booked codes`, the one manual step for reception), plus a separate `onEdit(e)` trigger that auto-timestamps a code the moment reception types it into "Booked codes".

- [ ] **Step 2: Manual deployment (done by the user, not by this repo)**

1. Open the Apps Script project tied to the existing `GOOGLE_SHEET_URL` webhook (Extensions → Apps Script, from the Google Sheet this project already logs bookings into).
2. Paste `handleAction25` from the `.gs` file as a new function in the project.
3. Find the existing `doPost(e)` function, and right after it parses the incoming JSON payload, add:
   ```javascript
   var action25Result = handleAction25(payload);
   if (action25Result) return action25Result;
   ```
4. Paste the `onEdit(e)` function from the `.gs` file too — a separate, standalone function (Apps Script runs it automatically on any spreadsheet edit; if you already have an `onEdit` function elsewhere in this project, merge the body in instead of having two).
5. In the Sheet itself, add a "Counters" tab with `A1 = "NextNumber"`, `B1 = 100`, and a "Booked codes" tab with header row `Code | Timestamp`.
6. Deploy → Manage deployments → edit the existing deployment → "New version" → Deploy. (Must be a new version of the *same* deployment so the `/exec` URL this repo already calls stays unchanged.)

- [ ] **Step 3: Verification**

Re-run the `curl` commands from Tasks 2 and 3's verification steps. `/api/lead-code` should now return sequential codes like `{"code":"G101"}`, `{"code":"S102"}`, incrementing on each call regardless of prefix. `/api/lead-log` should produce a new row in "Leads log" each time.

- [ ] **Step 4: Commit the reference file**

```bash
git add docs/google-apps-script/leads-webapp-additions.gs
git commit -m "Action 25: add Apps Script additions reference (deployed externally)"
```

---

### Task 5: Booking modals — new suffix, code in payload, success message

**Files:**
- Modify: `components/BookingModal.tsx`
- Modify: `components/ar/BookingModalAr.tsx`

**Interfaces:**
- Consumes: `appendLeadCode`, `getOrCreateLeadCode`, `pageLanguage` from `lib/leadCode.ts` (Task 1)

- [ ] **Step 1: `components/BookingModal.tsx` — replace the import and all 3 WA link usages**

Replace:
```typescript
import { appendSourceSuffix, getLeadSource } from "@/lib/sourceTag";
```
with:
```typescript
import { appendLeadCode, getOrCreateLeadCode, pageLanguage } from "@/lib/leadCode";
import { getLeadSource } from "@/lib/sourceTag";
```

Add state for the resolved WA hrefs (since `appendLeadCode` is now async) and the code to show on success. Replace the three `appendSourceSuffix("I%27d%20like%20to%20book%20an%20assessment")` call sites (lines ~159, ~278, ~293 in the current file) with a precomputed `waHref` state set once on mount:

```typescript
const [waHref, setWaHref] = useState(
  "https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
);
const [leadCode, setLeadCode] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;
  (async () => {
    const text = await appendLeadCode("I%27d%20like%20to%20book%20an%20assessment");
    if (!cancelled) setWaHref(`https://api.whatsapp.com/send?phone=201130946556&text=${text}`);
  })();
  return () => { cancelled = true; };
}, []);
```

Then replace every literal
```typescript
`https://api.whatsapp.com/send?phone=201130946556&text=${appendSourceSuffix("I%27d%20like%20to%20book%20an%20assessment")}`
```
with the `waHref` state variable.

- [ ] **Step 2: Send the code with the booking submission and capture it for the success screen**

In `handleSubmit`, before the `fetch("/api/booking", ...)` call, add:
```typescript
const { code } = await getOrCreateLeadCode();
```
and add `code, page_language: pageLanguage(),` to the JSON body:
```typescript
body: JSON.stringify({
  name,
  phone: phoneCheck.normalized,
  preferred_time: preferredTime || null,
  session_format: sessionFormat,
  note: note || null,
  source: "booking_modal",
  lead_source: getLeadSource(),
  code,
  page_language: pageLanguage(),
}),
```
After a successful (non-duplicate) submission, store it for display:
```typescript
setLeadCode(code);
```

- [ ] **Step 3: Show the code on the success screen**

In the `status === "success"` block, add a line after the existing description paragraph:
```tsx
{leadCode && (
  <p className="booking-modal__reference">Your reference: {leadCode}</p>
)}
```

- [ ] **Step 4: Repeat Steps 1-3 for `components/ar/BookingModalAr.tsx`**

Same changes, with the Arabic text default (`%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85`) instead of the English one, and the success-screen line as:
```tsx
{leadCode && (
  <p className="booking-modal__reference">رقم طلبك: {leadCode}</p>
)}
```

- [ ] **Step 5: Add the `.booking-modal__reference` style**

In `app/globals.css`, find the existing `.booking-modal__desc` rule and add a new rule right after it (same font/color family, slightly smaller, so it reads as a secondary detail — not a visual redesign, just enough styling that it doesn't render unstyled):
```css
.booking-modal__reference {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-charcoal);
  opacity: 0.7;
  margin-top: 4px;
}
```

- [ ] **Step 6: Manual verification**

Start the dev server, open the booking modal on `/`, submit a test booking, confirm:
- The "Message on WhatsApp" link's `href` ends in `%20<CODE>` instead of `%20%C2%B7G` when tested with `?gclid=test`, and ends in just `%20<CODE>` (no old marker at all) without `gclid`.
- After submitting, the success screen shows "Your reference: <CODE>".
- Repeat on `/ar` with "رقم طلبك: <CODE>".

- [ ] **Step 7: Commit**

```bash
git add components/BookingModal.tsx components/ar/BookingModalAr.tsx app/globals.css
git commit -m "Action 25: booking modals use lead codes, show reference on success"
```

---

### Task 6: `MidCTA` / `MidCTAAr` — new suffix only

**Files:**
- Modify: `components/MidCTA.tsx`
- Modify: `components/ar/MidCTAAr.tsx`

**Interfaces:**
- Consumes: `appendLeadCode` from `lib/leadCode.ts` (Task 1)

- [ ] **Step 1: `components/MidCTA.tsx`**

Replace:
```typescript
import { appendSourceSuffix } from "@/lib/sourceTag";
```
with:
```typescript
import { appendLeadCode } from "@/lib/leadCode";
```
Replace the `useEffect` body:
```typescript
useEffect(() => {
  setHref(WA_BASE + appendSourceSuffix(TEXT_DEFAULT));
}, []);
```
with:
```typescript
useEffect(() => {
  let cancelled = false;
  (async () => {
    const text = await appendLeadCode(TEXT_DEFAULT);
    if (!cancelled) setHref(WA_BASE + text);
  })();
  return () => { cancelled = true; };
}, []);
```

- [ ] **Step 2: Repeat for `components/ar/MidCTAAr.tsx`** (identical change, same pattern)

- [ ] **Step 3: Manual verification**

Scroll to the mid-page CTA on `/` and `/ar`, inspect the link's `href`, confirm it ends in `%20<CODE>`.

- [ ] **Step 4: Commit**

```bash
git add components/MidCTA.tsx components/ar/MidCTAAr.tsx
git commit -m "Action 25: mid-page CTA uses lead codes"
```

---

### Task 7: `ContactButton` / `ContactButtonAr` — new suffix + WhatsApp-click logging

**Files:**
- Modify: `components/ContactButton.tsx`
- Modify: `components/ar/ContactButtonAr.tsx`

**Interfaces:**
- Consumes: `appendLeadCode`, `getOrCreateLeadCode`, `pageLanguage` from `lib/leadCode.ts` (Task 1)

- [ ] **Step 1: `components/ContactButton.tsx` — replace the suffix and add logging**

Replace:
```typescript
import { appendSourceSuffix } from "@/lib/sourceTag";
```
with:
```typescript
import { appendLeadCode, getOrCreateLeadCode, pageLanguage } from "@/lib/leadCode";
```

Replace the `useEffect`:
```typescript
useEffect(() => {
  let text = TEXT_DEFAULT;
  try {
    const raw = localStorage.getItem("sama_lead");
    if (raw) {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > THREE_DAYS) {
        localStorage.removeItem("sama_lead");
      } else if (data.src === "form") {
        text = TEXT_FORM;
      }
    }
  } catch {}
  setHref(WA_BASE + appendSourceSuffix(text));
}, []);
```
with:
```typescript
useEffect(() => {
  let text = TEXT_DEFAULT;
  try {
    const raw = localStorage.getItem("sama_lead");
    if (raw) {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > THREE_DAYS) {
        localStorage.removeItem("sama_lead");
      } else if (data.src === "form") {
        text = TEXT_FORM;
      }
    }
  } catch {}
  let cancelled = false;
  (async () => {
    const encoded = await appendLeadCode(text);
    if (!cancelled) setHref(WA_BASE + encoded);
  })();
  return () => { cancelled = true; };
}, []);
```

Add logging to `handleClick` (keep the existing `sama_lead` localStorage logic exactly as-is, just add the beacon call):
```typescript
const handleClick = () => {
  try {
    const raw = localStorage.getItem("sama_lead");
    if (raw) {
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > THREE_DAYS) {
        localStorage.removeItem("sama_lead");
        localStorage.setItem("sama_lead", JSON.stringify({ ts: Date.now(), src: "wa" }));
        return;
      }
    }
    if (!raw) {
      localStorage.setItem("sama_lead", JSON.stringify({ ts: Date.now(), src: "wa" }));
    }
  } catch {}

  getOrCreateLeadCode().then(({ code, source, gclid, landingPage }) => {
    try {
      navigator.sendBeacon(
        "/api/lead-log",
        new Blob(
          [JSON.stringify({
            code, source, gclid,
            pageLanguage: pageLanguage(),
            landingPage,
            channel: "whatsapp",
          })],
          { type: "application/json" }
        )
      );
    } catch {}
  });
};
```

- [ ] **Step 2: Repeat for `components/ar/ContactButtonAr.tsx`** (identical pattern)

- [ ] **Step 3: Manual verification**

Click the floating WhatsApp button on `/` and `/ar`. In DevTools → Network, confirm a request to `/api/lead-log` fires with `channel: "whatsapp"`, and that it doesn't delay or break the WhatsApp tab opening.

- [ ] **Step 4: Commit**

```bash
git add components/ContactButton.tsx components/ar/ContactButtonAr.tsx
git commit -m "Action 25: floating WhatsApp button uses lead codes, logs clicks"
```

---

### Task 8: Phone-call click logging

**Files:**
- Modify: `components/Footer.tsx`
- Modify: `components/ar/FooterAr.tsx`
- Modify: `components/ContactInfo.tsx` (needs `"use client"` added — currently a server component)

**Interfaces:**
- Consumes: `getOrCreateLeadCode`, `pageLanguage` from `lib/leadCode.ts` (Task 1)

- [ ] **Step 1: Add a shared click handler in `components/Footer.tsx`**

Add the import:
```typescript
import { getOrCreateLeadCode, pageLanguage } from "@/lib/leadCode";
```
Add this function inside the component (or as a module-level helper if you prefer — it's identical in all three files, but these three components don't currently share a utils import, so duplicating ~12 lines three times matches this codebase's existing convention of small self-contained components over shared utils for one-off handlers):
```typescript
const logCallClick = () => {
  getOrCreateLeadCode().then(({ code, source, gclid, landingPage }) => {
    try {
      navigator.sendBeacon(
        "/api/lead-log",
        new Blob(
          [JSON.stringify({
            code, source, gclid,
            pageLanguage: pageLanguage(),
            landingPage,
            channel: "call",
          })],
          { type: "application/json" }
        )
      );
    } catch {}
  });
};
```
Add `onClick={logCallClick}` to the existing `<a href="tel:+201130946556" ...>` element.

- [ ] **Step 2: Repeat for `components/ar/FooterAr.tsx`** (identical pattern)

- [ ] **Step 3: `components/ContactInfo.tsx` — add `"use client"` and the same handler**

Add `"use client";` as the very first line of the file, then the same `logCallClick` function and `onClick` as Step 1.

- [ ] **Step 4: Manual verification**

Click each of the three phone links (footer EN, footer AR, contact-info block). Confirm a `/api/lead-log` request fires with `channel: "call"` each time, and the phone dialer still opens normally (the `tel:` navigation isn't blocked or delayed).

- [ ] **Step 5: Commit**

```bash
git add components/Footer.tsx components/ar/FooterAr.tsx components/ContactInfo.tsx
git commit -m "Action 25: log phone-call clicks with the lead code"
```

---

### Task 9: Server-side logging for form submissions

**Files:**
- Modify: `app/api/booking/route.ts`
- Modify: `app/api/contact/route.ts`

**Interfaces:**
- Consumes: `code` and `page_language` now present in the request body (sent by Task 5's `BookingModal`/`BookingModalAr` changes)

- [ ] **Step 1: `app/api/booking/route.ts`**

Add `code, page_language` to the destructured body:
```typescript
const { name, phone, preferred_time, session_format, note, source, lead_source, code, page_language } = body;
```
After the existing Google Sheet push (inside the same `try` block, right after the `fetch(GOOGLE_SHEET_URL, ...)` call for the booking data itself), add a second, separate fire-and-forget call for the lead log:
```typescript
if (code) {
  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "logLead",
      code,
      source: lead_source === "google_ads" ? "G" : "D",
      gclid: "",
      pageLanguage: page_language || "en",
      landingPage: "",
      channel: "form",
      name,
      phone,
    }),
  }).catch((err) => console.error("lead-log (booking) failed:", err));
}
```

- [ ] **Step 2: `app/api/contact/route.ts`** — same pattern, adapted to this route's field names (`first_name`, `last_name`, `email` standing in for phone):

Add `code, page_language` to the destructured body, and after the existing sheet push:
```typescript
if (code) {
  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "logLead",
      code,
      source: "D",
      gclid: "",
      pageLanguage: page_language || "en",
      landingPage: "",
      channel: "form",
      name: `${first_name} ${last_name}`,
      phone: email,
    }),
  }).catch((err) => console.error("lead-log (contact) failed:", err));
}
```

(The contact form isn't in Task 5's scope for a visible success-message change since the spec's example is about the booking modal; if `/api/contact`'s caller also wants to send a `code`, wire it the same way Task 5 did for booking — flagged here but not required unless you want it.)

- [ ] **Step 3: Manual verification**

Submit a test booking with the dev server running, confirm a row appears in "Leads log" with `channel = form` and the same code shown on the success screen.

- [ ] **Step 4: Commit**

```bash
git add app/api/booking/route.ts app/api/contact/route.ts
git commit -m "Action 25: log form submissions to the Leads log sheet"
```

---

### Task 10: `SourceTagCapture` — ensure a code exists on first mount

**Files:**
- Modify: `components/SourceTagCapture.tsx`

**Interfaces:**
- Consumes: `getOrCreateLeadCode` from `lib/leadCode.ts` (Task 1)

- [ ] **Step 1: Extend the component**

```typescript
"use client";
import { useEffect } from "react";
import { captureAdsClickId } from "@/lib/sourceTag";
import { getOrCreateLeadCode } from "@/lib/leadCode";

/* Mounted once per public layout (EN + AR). Captures a Google Ads click ID
   (gclid/gbraid/wbraid), if present in the URL, into localStorage so
   WhatsApp links and the booking form can be tagged later in the visit.
   Also ensures this visitor has a lead reference code cached for the
   next 30 days (Action 25) — fire-and-forget, doesn't block rendering.
   Renders nothing. */
export default function SourceTagCapture() {
  useEffect(() => {
    captureAdsClickId();
    getOrCreateLeadCode();
  }, []);

  return null;
}
```

- [ ] **Step 2: Manual verification**

Open `/ar?gclid=test123` fresh (clear `localStorage` first), wait a second, check Application → Local Storage for a `sama_lead_code` entry with `source: "G"`, `gclid: "test123"`. Open a fresh incognito tab to `/` with no params and no referrer, confirm `source: "D"`.

- [ ] **Step 3: Commit**

```bash
git add components/SourceTagCapture.tsx
git commit -m "Action 25: pre-fetch the lead code on first page load"
```

---

### Task 11: Google Sheet setup (manual, by the user)

**Files:** none in this repo — this is spreadsheet configuration.

- [ ] **Step 1:** Confirm Task 4's "Counters" tab exists with `A1 = "NextNumber"`, `B1 = 100`.
- [ ] **Step 2:** Confirm the "Leads log" tab was auto-created (it will be, the first time `logLead` fires) with the header row: `Timestamp | Code | Source | GCLID | Page Language | Landing Page | Channel | Name | Phone`. Fully automatic — never edited by hand.
- [ ] **Step 3:** Add a new tab named **"Booked codes"** with header row `Code | Timestamp`. This is the ONLY manual step: when a lead actually books, reception types its code into column A. Column B fills itself automatically via the `onEdit(e)` trigger in Task 4's Apps Script file.
- [ ] **Step 4:** Add a new tab named **"Ads upload"**. In cell `A1`, enter this formula (requires `LAMBDA`/array-formula support, available in current Google Sheets):

```
={"Google Click ID","Conversion Name","Conversion Time";
  FILTER(
    HSTACK(
      IFNA(VLOOKUP('Booked codes'!A2:A1000,'Leads log'!B:D,3,FALSE),""),
      ARRAYFORMULA(IF('Booked codes'!A2:A1000<>"","Booking","")),
      ARRAYFORMULA(IF('Booked codes'!B2:B1000<>"",TEXT('Booked codes'!B2:B1000,"yyyy-MM-dd HH:mm:ss")&"+0200",""))
    ),
    ('Booked codes'!A2:A1000<>"") * (IFNA(VLOOKUP('Booked codes'!A2:A1000,'Leads log'!B:D,3,FALSE),"")<>"")
  )}
```

For every code in "Booked codes", this looks up its GCLID from "Leads log" (column B→D: Code→GCLID) and outputs a row only if both a code and a matching non-empty GCLID exist — producing exactly the three columns Google Ads expects. Conversion Time uses the booking's own timestamp (when reception entered the code), not the original lead's first-touch time. (Conversion Value is intentionally left out — add a 4th `HSTACK` argument, e.g. a literal `500`, if you want a fixed value per booking.)
- [ ] **Step 5:** Reception's day-to-day workflow: type a code into "Booked codes" column A whenever that lead books. Nothing else to do — the timestamp, the "Leads log" lookup, and the "Ads upload" tab are all automatic.

---

### Task 12: Google Ads setup (manual, by the user)

**Files:** none — this is Google Ads account configuration. Exact steps:

- [ ] **Step 1: Create the offline conversion action**
  1. Google Ads → Tools & Settings → **Conversions**.
  2. **+ New conversion action** → **Import** → **Other data sources or CRMs** → **Track conversions from clicks**.
  3. Name it exactly **`Booking`** (must match the "Conversion Name" column the sheet formula outputs).
  4. Category: **Sign-up** (or whatever best matches a booking in your account's category list).
  5. Value: **Don't use a value** unless you added a Conversion Value column in Task 11 — if you did, choose "Use different values for each conversion."
  6. Count: **One** — a phone number should only count once even if logged multiple times.
  7. Click-through conversion window: **30 days** (matches this system's 30-day lead-code window).
  8. Attribution model: leave at the account default (usually data-driven) unless you have a reason to change it.
  9. **Goal and action optimization → set this conversion action to Secondary**, not Primary — it won't count toward Smart Bidding/campaign optimization until you switch it to Primary later, once there's enough booking volume to trust it.
  10. Save.

- [ ] **Step 2: Schedule the Sheets upload**
  1. Google Ads → Tools & Settings → **Conversions** → **Uploads** (left sidebar) → **+ New upload**.
  2. Choose **Google Sheets transfer**.
  3. Paste the URL of this Google Sheet, and select the **"Ads upload"** tab specifically.
  4. Map columns: `Google Click ID` → GCLID, `Conversion Name` → the `Booking` action from Step 1, `Conversion Time` → conversion time.
  5. Set the schedule to **daily** (Google Ads runs this recurring import itself — no cron job or code needed on this repo's side).
  6. Save. Google Ads will now pull new "Booked = Y" rows from the sheet every day automatically.

---

### Task 13: Full manual QA pass on the Vercel preview

**Files:** none — verification only.

- [ ] **Step 1:** Push the branch, confirm the Vercel preview builds successfully on both `sama-wellness` and `sama-wellness-therapy` projects.
- [ ] **Step 2: Google Ads source (G).** Open the preview with `?gclid=test123`. Click the floating WhatsApp button — confirm the pre-filled message ends in a code like `G101` (not `·G`). Check "Leads log" for a `channel=whatsapp, source=G` row.
- [ ] **Step 3: Direct source (D).** Open the preview with no query params, no referrer (fresh incognito). Repeat the WhatsApp check — code should start with `D`.
- [ ] **Step 4: Form submission.** Open the booking modal, submit a test booking. Confirm the success screen shows "Your reference: <CODE>" (EN) / "رقم طلبك: <CODE>" (AR on `/ar`). Confirm the SAME code was used as the WhatsApp button's code earlier in that session (30-day reuse working).
- [ ] **Step 5: Call click.** Click a `tel:` link (footer or contact-info block). Confirm a `/api/lead-log` request fires with `channel=call` and the dialer still opens.
- [ ] **Step 6: Fallback path.** Temporarily break the counter (e.g. point `/api/lead-code` at a bad URL locally, or just trust Task 2's curl test from before Task 4 was deployed) and confirm a lead still gets a usable `<prefix><3 random chars>` code instead of hanging or erroring.
- [ ] **Step 7: No visual regressions.** Screenshot the booking modal (idle + success states) and the WhatsApp-button area on `/` and `/ar` before/after — confirm nothing changed except the reference-code line and the WhatsApp text's trailing code.
- [ ] **Step 8: Ads upload tab.** Mark one "Leads log" row `Booked = Y` with a GCLID present, confirm it appears in "Ads upload" within a few seconds (sheet formulas recalculate live).
- [ ] **Step 9:** Report results back in chat. Wait for approval before merging to production.

---

## Self-Review

**Spec coverage:**
- Code format (prefix + global sequential number, random fallback) → Tasks 1, 2, 4. ✅
- 30-day reuse per visitor → Task 1 (`localStorage`, same pattern as `sama_src`). ✅
- WhatsApp placement, replacing `" ·G"` → Tasks 5, 6, 7. ✅
- Form hidden field + success message → Task 5 (sent in JSON body, shown only on success — no visible field while filling, matching the spec's intent without an unused literal `<input type="hidden">`). ✅
- Call logging → Task 8. ✅
- "Leads log" tab with the exact specified columns → Task 4. ✅
- "Ads upload" tab, Google Ads import format → Task 11. ✅
- Google Ads conversion action + schedule instructions → Task 12. ✅
- No visual changes except the two named exceptions → Tasks 5 Step 5 (minimal new CSS rule, text-only addition), confirmed in Task 13 Step 7. ✅
- Don't break GA4/Ads tags/·G until replaced → `lib/sourceTag.ts`'s gclid capture is reused, not removed; `lib/leadCode.ts` is additive. The `" ·G"` marker itself IS removed as part of this work (per spec item 1: "replacing the current suffix"), which is the explicit intent, not an accidental break. ✅
- No new paid infra → counter + logging live in the existing Google Sheet via Apps Script. ✅
- Preview only, no production merge without approval → Task 13 Step 9. ✅

**Placeholder scan:** none found — every step has complete, real code.

**Type consistency:** `LeadCodeInfo` (`code`, `source`, `gclid`, `landingPage`) is defined once in Task 1 and used with the same field names throughout Tasks 5-10. `LeadSource` (`"G"|"S"|"I"|"D"`) is consistent across Tasks 1, 2, and 4's Apps Script (which uppercases and validates against the same four values).
