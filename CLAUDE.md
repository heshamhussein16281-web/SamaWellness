# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build (also runs type checking)
npm run lint     # ESLint via next lint
npm run start    # Start production server after build
```

No test suite is configured.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

The Supabase client in `lib/supabase.ts` uses placeholder values when env vars are missing (prevents crashes in dev without a DB).

## Architecture

Single-page Next.js 14 App Router site. The entire page is assembled in `app/page.tsx` from section components rendered top-to-bottom: `Navbar → Hero → Services → Process → Team → Contact → Footer + WhatsAppButton`.

All sections use `id` attributes matching navbar link `href` values for smooth-scroll navigation (`home`, `services`, `process`, `team`, `contact`).

**Data flow:** The `Contact` component writes directly to Supabase from the browser using the anon key. There is no API route — submissions go client → Supabase `contact_submissions` table.

**Team data** lives in `lib/team-data.ts` (not a DB query).

## CSS Architecture — 3-Layer System

Styling is split between `app/globals.css` (primary) and Tailwind utility classes. The globals.css follows a strict 3-layer convention:

- **Layer 1 — Design Tokens** (`:root`): All colors, spacing, fonts, transitions, and component-specific dimensions as CSS variables. Change here; updates propagate everywhere.
- **Layer 2 — Layout Containers** (`.section__inner`, grids, flex wrappers): Only `display`, `grid`, `flex`, `gap`, `padding`, `margin`, `width`, `position`. **Never** colors, fonts, borders, or shadows in this layer.
- **Layer 3 — Components** (`.btn-outline`, `.nav-link`, `.service-card`, etc.): Self-contained visual units with full styles.

**Responsive breakpoints:**
- Desktop nav vs. mobile burger: `≥769px` / `≤768px` via `.navbar__desktop-nav` / `.navbar__mobile-toggle`
- Content reflow (services grid → 1 col, team → 2 col): `≤980px`
- Team → 1 col: `≤560px`

Navbar show/hide is controlled **only** through CSS `@media` classes (`.navbar__desktop-nav`, `.navbar__mobile-toggle`). Do not use Tailwind or inline styles to toggle these — the CSS layer handles it to avoid specificity conflicts.

## Design Tokens

| Token | Value |
|---|---|
| `--color-linen` | `#F5F2EE` (page background) |
| `--color-sand` | `rgb(234, 228, 221)` (borders, Services bg) |
| `--color-nav-text` | `rgb(45, 74, 70)` (dark teal) |
| `--color-burgundy` | `#7b2d3e` (CTA, accents) |
| `--color-olive` | `#4a6741` (success states) |
| `--color-charcoal` | `#2c2c2c` (body text) |
| `--navbar-height` | `175px` (also used as `scroll-margin-top` on all `section[id]`) |

Fonts loaded via `next/font/google` in `app/layout.tsx`: **Gilda Display** (`--font-display`), **Nunito Sans** (`--font-body`), **Josefin Sans** (`--font-ui`). The Tailwind config also references Cormorant Garamond/DM Sans/Montserrat for utility classes, but the CSS variables take precedence in globals.css.

## Navbar Active State

The active nav link underline is drawn via `.nav-link::after` pseudo-element using `scaleX` transform — **not** inline `borderBottom`. Adding inline border styles will cause a double underline. Active state is set both on click (immediate) and on scroll (debounced 150ms), with a `__setNavScrolling` flag on `window` to suppress scroll events during programmatic scrolling.
