# Action 26 — Success Message + Consistent Assessment Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop showing the internal lead reference code on the booking form's success screen (EN + AR), reword that screen to not name WhatsApp, and make every "free 15-minute assessment" CTA across the site open the same form-or-WhatsApp booking modal instead of some going straight to WhatsApp.

**Architecture:** No new files, no new tracking logic. (1) Delete the `leadCode` display state and JSX from `BookingModal.tsx` / `BookingModalAr.tsx` and swap in new copy — the code itself keeps flowing silently through the existing hidden POST body (`code` field → `lead_source` column + "Leads log" tab), untouched. (2) Rewrite `MidCTA.tsx` / `MidCTAAr.tsx` — currently the only CTAs that link straight to WhatsApp — to open `<BookingModal>` / `<BookingModalAr>` the same way `FinalCTA`, `BlogCTA`, `HeroBookingCTA`, and `HowItWorksIcons` already do, dropping their own standalone WhatsApp-href/lead-code logic since the modal already handles that internally.

**Tech Stack:** Next.js 14 App Router, TypeScript, existing `lib/leadCode.ts`.

## Global Constraints
- The client must never see the reference code again, anywhere except inside the WhatsApp pre-filled message text.
- The code must still be saved silently with every form submission (hidden field → `lead_source` column + "Leads log" tab) — no change to that data path.
- No layout, colour, or copy changes beyond the one success-message text change specified.
- Keep Arabic right-to-left; match each page's existing tone/dialect (Egyptian colloquial, not MSA) for any new copy — confirm final text with the user before implementing it.
- Keep Action 25 lead-code tracking working on every path — form, WhatsApp, and call.
- Preview only (Vercel). Do not merge to production until the user approves in chat.
- Plain "chat with us" WhatsApp icon buttons (not the assessment CTA) are explicitly out of scope and must not be changed.

---

## Investigation Findings (read before starting)

**Every "15-minute assessment" CTA on the live site, and its current behaviour:**

| File | Used on | Current behaviour | Action |
|---|---|---|---|
| `components/HeroBookingCTA.tsx` + `ar/HeroBookingCTAAr.tsx` | Homepage hero (`Hero.tsx`) | Opens `BookingModal` | None — already compliant |
| `components/FinalCTA.tsx` + `ar/FinalCTAAr.tsx` | Every page (homepage, services, team, rooms, ask, blog index/posts) | Opens `BookingModal` | None — already compliant |
| `components/BlogCTA.tsx` + `ar/BlogCTAAr.tsx` | Blog post pages | Opens `BookingModal` | None — already compliant |
| `components/HowItWorksIcons.tsx` + `ar/HowItWorksIconsAr.tsx` | Homepage "How It Works" | Opens `BookingModal` | None — already compliant |
| `components/MidCTA.tsx` + `ar/MidCTAAr.tsx` | Every page ("Not sure where to start? Book a free 15-min assessment →") | **Links straight to WhatsApp** (`api.whatsapp.com`), bypassing the modal entirely | **Fix in Task 2** |
| `components/ContactButton.tsx` + `ar/ContactButtonAr.tsx` | Sticky floating icon, rendered in `app/(public)/layout.tsx` and the Arabic layout, on every page | Icon-only, `aria-label`/`title` = "Chat on WhatsApp" — generic chat, not an assessment CTA | **Out of scope — stays as is** (matches the user's own "plain WhatsApp icon... stays" rule) |
| `components/WhatsAppButton.tsx` | Not imported anywhere (dead code) | N/A | Not touched |

A full-tree grep for `api.whatsapp.com` / `wa.me` / `window.open` across every live page and component (`app/(public)`, `app/(arabic)`, `components/**`, excluding the experimental `app/preview/*` sketches which aren't routed from any live page) confirms the table above is exhaustive — `MidCTA`/`MidCTAAr` are the only two non-compliant CTAs.

Also found, explicitly left alone because the spec caps this action to the one success-message text change:
- The "already submitted" duplicate-state message in `BookingModal.tsx`/`BookingModalAr.tsx` also names WhatsApp ("We've received your request and will contact you on WhatsApp..."). Not changed here — flag to user as a possible follow-up.
- The `/ask` FAQ copy (`FAQAccordion.tsx`, structured data in `app/(public)/ask/page.tsx`) mentions WhatsApp a few times. That's informational copy, not a CTA — out of scope.

**Resolved:** user confirmed the dialect-matched Arabic for the success screen, and asked to also fix the *duplicate*-submission screen (shown when the same visitor submits twice) in this same action — it also named WhatsApp. Final text for all four strings:
- EN success: "Thank you — we've received your request. Our team will contact you shortly."
- AR success: "شكرًا ليك — استلمنا طلبك، وهيتواصل معاك فريقنا قريب."
- EN duplicate (form): "We've already received your request — our team will contact you shortly."
- AR duplicate (form): "استلمنا طلبك قبل كده — وهيتواصل معاك فريقنا قريب."

The *other* duplicate variant (`dupSrc === "wa"`, shown when the visitor themselves already messaged on WhatsApp) is left unchanged in both languages — it describes the channel *they* used, not a promise from us, so naming WhatsApp there is still accurate and wasn't part of the user's request.

---

## Task 1: Remove the reference code from the booking success screen, reword it (EN + AR)

**Files:**
- Modify: `components/BookingModal.tsx:38-224` (state, handleSubmit, success JSX)
- Modify: `components/ar/BookingModalAr.tsx` (mirrored lines)
- Modify: `app/globals.css:3439` (remove the now-dead `.booking-modal__reference` rule)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — `handleSubmit`'s POST body (`code`, `gclid`, `landing_page`, `page_language`) is unchanged, so `/api/booking` and the Apps Script side need no changes.

- [ ] **Step 1: Remove the `leadCode` state and its three other usages in `BookingModal.tsx`**

  In `components/BookingModal.tsx`:
  - Delete line 42: `const [leadCode, setLeadCode] = useState<string | null>(null);`
  - In `resetAndClose` (around line 95), delete: `setLeadCode(null);`
  - In `handleSubmit` (around line 123-124), change:
    ```tsx
    const { code, gclid, landingPage } = await getOrCreateLeadCode();
    setLeadCode(code);
    ```
    to:
    ```tsx
    const { code, gclid, landingPage } = await getOrCreateLeadCode();
    ```
  - `code` is still used two lines later in the `fetch("/api/booking", ...)` body — leave that untouched.

- [ ] **Step 2: Replace the success-screen JSX and copy in `BookingModal.tsx`**

  Replace (around line 216-222):
  ```tsx
            <h2 className="booking-modal__heading">We&apos;ll Be in Touch</h2>
            <p className="booking-modal__desc">
              We&apos;ll contact you on WhatsApp from 01130946556 within a few hours to schedule your assessment — no need to message us.
            </p>
            {leadCode && (
              <p className="booking-modal__reference">Your reference: {leadCode}</p>
            )}
  ```
  with:
  ```tsx
            <h2 className="booking-modal__heading">We&apos;ll Be in Touch</h2>
            <p className="booking-modal__desc">
              Thank you — we&apos;ve received your request. Our team will contact you shortly.
            </p>
  ```

- [ ] **Step 3: Mirror both changes in `components/ar/BookingModalAr.tsx`**

  Remove the same `leadCode` state/setter/reset (identical line shape to `BookingModal.tsx`).

  Replace (around line 216-222):
  ```tsx
            <h2 className="booking-modal__heading">هنتواصل معاك قريب</h2>
            <p className="booking-modal__desc">
              هنتواصل معاك على واتساب من رقم 01130946556 خلال ساعات قليلة عشان نحدد معاد التقييم، مش محتاج تبعتلنا رسالة.
            </p>
            {leadCode && (
              <p className="booking-modal__reference">رقم طلبك: {leadCode}</p>
            )}
  ```
  with (pending the user's confirmation of the exact Arabic wording per the Open Item above):
  ```tsx
            <h2 className="booking-modal__heading">هنتواصل معاك قريب</h2>
            <p className="booking-modal__desc">
              شكرًا ليك — استلمنا طلبك، وهيتواصل معاك فريقنا قريب.
            </p>
  ```

- [ ] **Step 4: Remove the now-dead `.booking-modal__reference` CSS rule**

  In `app/globals.css`, delete the rule at line 3439:
  ```css
  .booking-modal__reference {
    font-family: var(--font-body);
    font-size: 13px;
    color: #777;
    margin: -12px 0 20px;
  }
  ```

- [ ] **Step 5: Type-check**

  Run: `npx tsc --noEmit`
  Expected: no errors (confirms `leadCode` removal didn't leave a dangling reference).

- [ ] **Step 6: Commit**

  ```bash
  git add components/BookingModal.tsx components/ar/BookingModalAr.tsx app/globals.css
  git commit -m "Action 26: hide lead reference code from booking success screen, reword without naming WhatsApp"
  ```

---

## Task 2: Make `MidCTA` / `MidCTAAr` open the booking modal instead of linking straight to WhatsApp

**Files:**
- Modify: `components/MidCTA.tsx` (full rewrite — currently 60 lines, drops to ~25)
- Modify: `components/ar/MidCTAAr.tsx` (mirrored rewrite)
- Modify: `app/globals.css:3256-3265` (`.mid-cta__link` — add button-chrome reset so a `<button>` renders identically to the old `<a>`)

**Interfaces:**
- Consumes: `BookingModal` (`isOpen`, `onClose` props, already defined) / `BookingModalAr`.
- Produces: nothing new for other tasks.

- [ ] **Step 1: Rewrite `components/MidCTA.tsx`**

  Replace the entire file with:
  ```tsx
  "use client";
  import { useState } from "react";
  import BookingModal from "./BookingModal";

  export default function MidCTA() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <section className="mid-cta" aria-label="Book a free assessment">
        <div className="mid-cta__inner">
          <p className="mid-cta__text">
            Not sure where to start?&ensp;
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mid-cta__link"
            >
              Book a free 15-min assessment&nbsp;&rarr;
            </button>
          </p>
        </div>
        <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </section>
    );
  }
  ```

- [ ] **Step 2: Rewrite `components/ar/MidCTAAr.tsx`**

  Replace the entire file with:
  ```tsx
  "use client";
  import { useState } from "react";
  import BookingModalAr from "./BookingModalAr";

  export default function MidCTAAr() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <section className="mid-cta" aria-label="احجز تقييم مجاني">
        <div className="mid-cta__inner">
          <p className="mid-cta__text">
            مش متأكد تبدأ منين؟&ensp;
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mid-cta__link"
            >
              احجز تقييم مجاني ١٥ دقيقة&nbsp;&larr;
            </button>
          </p>
        </div>
        <BookingModalAr isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </section>
    );
  }
  ```

- [ ] **Step 3: Reset button chrome on `.mid-cta__link` so it still looks like the old inline text link**

  In `app/globals.css`, change the rule at line 3256:
  ```css
  .mid-cta__link {
    font-family: var(--font-ui);
    font-weight: 400;
    color: var(--color-burgundy);
    text-decoration: none;
    border-bottom: 1px solid rgba(123, 45, 62, 0.3);
    padding-bottom: 1px;
    transition: var(--transition-base);
    white-space: nowrap;
  }
  ```
  to:
  ```css
  .mid-cta__link {
    font-family: var(--font-ui);
    font-weight: 400;
    font-size: inherit;
    color: var(--color-burgundy);
    text-decoration: none;
    border: none;
    border-bottom: 1px solid rgba(123, 45, 62, 0.3);
    background: none;
    padding: 0 0 1px 0;
    cursor: pointer;
    transition: var(--transition-base);
    white-space: nowrap;
  }
  ```
  (`.mid-cta__link:hover`, the `[dir="rtl"]` font-family override, and the `@media (max-width: 640px)` rules at lines 3267-3289 are untouched — none of them need adjustment for the tag swap.)

- [ ] **Step 4: Type-check**

  Run: `npx tsc --noEmit`
  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add components/MidCTA.tsx components/ar/MidCTAAr.tsx app/globals.css
  git commit -m "Action 26: MidCTA opens the booking modal instead of linking straight to WhatsApp"
  ```

---

## Task 3: Deploy to Vercel preview and verify end-to-end

**Files:** none (verification only).

- [ ] **Step 1: Push the branch**

  ```bash
  git push origin feature/action-26-success-message-cta-consistency
  ```

- [ ] **Step 2: Visual parity check — MidCTA**

  On the preview, open `/` and `/ar` (and one more page each, e.g. `/services` / `/ar/services`). Screenshot the "Not sure where to start?" line before/after — confirm the button is visually indistinguishable from the old link (same color, underline, position, no button background/border visible).

- [ ] **Step 3: Click-through check — MidCTA now opens the modal**

  Click "Book a free 15-min assessment →" on `/` and "احجز تقييم مجاني ١٥ دقيقة ←" on `/ar`. Confirm the standard booking modal opens (form + "Message on WhatsApp" option) instead of a new WhatsApp tab.

- [ ] **Step 4: Submit the form — confirm the new success copy and no visible code**

  Submit a test booking through the modal (any entry point). Confirm:
  - Success screen reads "Thank you — we've received your request. Our team will contact you shortly." (EN) / the confirmed Arabic text (AR) — no "Your reference: Gxxx" / "رقم طلبك" line anywhere.
  - Via `read_network_requests`, confirm the `/api/booking` POST body still includes a non-empty `code` field (the tracking data path is unchanged even though it's no longer displayed).

- [ ] **Step 5: WhatsApp path still carries the code**

  Click "Message on WhatsApp" inside the modal (or any already-compliant CTA like Hero/FinalCTA). Confirm the pre-filled WhatsApp text still ends with the lead code (e.g. `...assessment G110`), exactly as before — this path is untouched by this action but must keep working.

- [ ] **Step 6: Confirm the floating "Chat on WhatsApp" icon is untouched**

  Confirm `ContactButton`/`ContactButtonAr` (bottom-corner icon-only button, present on every page) still opens WhatsApp directly, unchanged — this was intentionally left out of scope.

- [ ] **Step 7: Report results to the user**

  Share the preview link, the before/after MidCTA screenshots, and confirmation of steps 2-6. Wait for explicit chat approval before merging to production.
