/* ========================================
   NAVBAR COMPONENT

   Purpose: Sticky navigation header with scroll-based active state

   Features:
   - Sticky header (175px height, zIndex 100)
   - Active nav link underline based on scroll position
   - Desktop nav (5 items) + mobile menu toggle
   - Smooth scroll to section with locking during animation
   - Responsive: desktop nav visible ≥769px, burger + dropdown <769px

   Design System Integration:
   - All show/hide logic lives in globals.css Layer 2 — NO Tailwind
     responsive classes on navbar elements (they conflict with inline styles)
   - Colors: var(--color-linen), var(--color-nav-text), var(--color-sand)
   - Typography: var(--font-ui)
   - Spacing: var(--space-*)
   - Breakpoint token: --navbar-breakpoint (768px), defined in :root

   Active State:
   - Underline drawn via .nav-link::after pseudo-element (CSS only)
   - No inline borderBottom — prevents double underline
   - Smooth scaleX transition in both directions

   Scroll Detection:
   - Debounced scroll listener (150ms)
   - Locks updates during programmatic scroll (click navigation)

   Structure (BEM):
   .navbar                        — sticky header shell (Layer 2)
     ├─ .navbar__logo-link        — logo anchor (Layer 3)
     ├─ .navbar__desktop-nav      — horizontal link list, desktop only (Layer 2)
     │    └─ .nav-link[.active]   — individual link (Layer 3)
     ├─ .navbar__mobile-toggle    — hamburger button, mobile only (Layer 2+3)
     └─ .navbar__mobile-menu      — dropdown, mobile only (Layer 3)
          └─ .nav-link[.active]   — individual link (Layer 3)
   ======================================== */

"use client";
import { useState, useEffect } from "react";

/* ─── Navigation link definitions ─── */
const links = [
  { label: "HOME",        href: "home"     },
  { label: "OUR SERVICES",href: "services" },
  { label: "THE PROCESS", href: "process"  },
  { label: "THE TEAM",    href: "team"     },
  { label: "CONTACT US",  href: "contact"  },
];

export default function Navbar() {
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState("home");

  /* ─── Scroll detection ─── */
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let isScrollingProgrammatically = false;

    const handleScroll = () => {
      if (isScrollingProgrammatically) return;
      if (scrollTimer) clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        const scrollY = window.scrollY + 200;
        for (let i = links.length - 1; i >= 0; i--) {
          const el = document.getElementById(links[i].href);
          if (el && el.offsetTop <= scrollY) {
            setActive(links[i].href);
            break;
          }
        }
      }, 150);
    };

    /* Expose lock so handleClick can pause scroll detection */
    (window as any).__setNavScrolling = (val: boolean) => {
      isScrollingProgrammatically = val;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  /* ─── Click: smooth scroll + active lock ─── */
  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) {
      const top = el.offsetTop - 175 + 1;
      (window as any).__setNavScrolling?.(true);
      setActive(href);
      window.scrollTo({ top, behavior: "smooth" });
      setTimeout(() => (window as any).__setNavScrolling?.(false), 900);
    }
    setOpen(false);
  };

  return (
    /* ════════════════════════════════════════
       LAYER 2 — navbar shell
       Height, position, z-index only.
       Visual (bg, border) kept minimal inline
       because they are fixed pixel values from
       the original site inspection.
       ════════════════════════════════════════ */
    <header
      className="navbar"
      style={{
        height: "175px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--color-linen)",
        borderBottom: "1px solid var(--color-sand)",
        width: "100%",
        overflow: "visible",
      }}
    >

      {/* ── Logo ── */}
      <a
        href="#home"
        onClick={(e) => handleClick(e, "home")}
        className="navbar__logo-link logo-link"
        style={{
          position: "absolute",
          top: "-7px",
          left: "-3px",
          display: "block",
          width: "182px",
          height: "182px",
          zIndex: 10,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Sama Wellness Therapy"
          style={{
            width: "182px",
            height: "182px",
            objectFit: "contain",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </a>

      {/* ════════════════════════════════════════
          LAYER 2 — desktop nav container
          Shown ≥769px via .navbar__desktop-nav in
          globals.css. No Tailwind classes — they
          conflict with inline display:flex.
          ════════════════════════════════════════ */}
      <nav
        className="navbar__desktop-nav"
        style={{
          position: "absolute",
          left: "265px",
          top: "42px",
          width: "1159px",
          height: "84px",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "normal",
          columnGap: "44px",
          rowGap: "12px",
        }}
      >
        {links.map((l) => (
          <a
            key={l.href}
            href={`#${l.href}`}
            onClick={(e) => handleClick(e, l.href)}
            className={`nav-link${active === l.href ? " active" : ""}`}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "22.7px",
              fontWeight: 300,
              lineHeight: "29.52px",
              letterSpacing: "-0.02em",
              color: "var(--color-nav-text)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textDecoration: "none",
              padding: "4px 13.36px",
              cursor: "pointer",
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* ════════════════════════════════════════
          LAYER 2 — mobile toggle (burger)
          Hidden ≥769px via .navbar__mobile-toggle
          in globals.css. No Tailwind classes.
          ════════════════════════════════════════ */}
      <button
        className="navbar__mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {/* ── LAYER 3: burger icon bars ── */}
        <span
          className="navbar__burger-bar"
          style={{ transform: open ? "rotate(45deg) translateY(7px)" : "none" }}
        />
        <span
          className="navbar__burger-bar navbar__burger-bar--mid"
          style={{ opacity: open ? 0 : 1 }}
        />
        <span
          className="navbar__burger-bar"
          style={{ transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }}
        />
      </button>

      {/* ════════════════════════════════════════
          LAYER 3 — mobile dropdown menu
          Rendered only when open=true.
          Visible only on mobile (≤768px) because
          the toggle that controls it is hidden on
          desktop, so `open` can never be true there.
          ════════════════════════════════════════ */}
      {open && (
        <div className="navbar__mobile-menu">
          {links.map((l) => (
            <a
              key={l.href}
              href={`#${l.href}`}
              onClick={(e) => handleClick(e, l.href)}
              className={`nav-link navbar__mobile-link${active === l.href ? " active" : ""}`}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

    </header>
  );
}
