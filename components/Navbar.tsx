/* ========================================
   NAVBAR COMPONENT
   
   Purpose: Sticky navigation header with scroll-based active state
   
   Features:
   - Sticky header (175px height, zIndex 100)
   - Active nav link underline based on scroll position
   - Desktop nav (5 items) + mobile menu toggle
   - Smooth scroll to section with locking during animation
   - Responsive (hidden on mobile, toggle button below 768px)
   
   Design System Integration:
   - Colors: var(--color-linen), var(--color-nav-text), var(--color-sand)
   - Typography: var(--font-ui)
   - Spacing: var(--space-*)
   - Transitions: var(--transition-base)
   
   Active State:
   - Underline drawn via .nav-link::after pseudo-element in globals.css (CSS only)
   - No inline borderBottom — prevents double underline
   - Smooth scaleX transition in both directions (in and out)
   
   Scroll Detection:
   - Debounced scroll listener (150ms)
   - Detects which section user is viewing
   - Updates active nav item with smooth CSS animation
   - Locks updates during programmatic scroll (click navigation)
   
   Structure:
   - Header: sticky container
     ├─ Logo: positioned absolutely
     ├─ Desktop nav: horizontal list (5 items)
     ├─ Mobile toggle: hamburger button (hidden on desktop)
     └─ Mobile menu: dropdown (shown when toggle is open)
   ======================================== */

"use client";
import { useState, useEffect } from "react";

/**
 * Navigation Links Configuration
 */
const links = [
  { label: "HOME", href: "home" },
  { label: "OUR SERVICES", href: "services" },
  { label: "THE PROCESS", href: "process" },
  { label: "THE TEAM", href: "team" },
  { label: "CONTACT US", href: "contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

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

    (window as any).__setNavScrolling = (val: boolean) => {
      isScrollingProgrammatically = val;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) {
      const headerH = 175;
      const top = el.offsetTop - headerH + 1;

      (window as any).__setNavScrolling?.(true);
      setActive(href);

      window.scrollTo({ top, behavior: "smooth" });

      setTimeout(() => {
        (window as any).__setNavScrolling?.(false);
      }, 900);
    }

    setOpen(false);
  };

  return (
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
      {/* Logo */}
      <a
        href="#home"
        onClick={(e) => handleClick(e, "home")}
        className="logo-link"
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

      {/* Desktop Navigation */}
      <nav
        className="navbar__desktop-nav hidden md:flex"
        style={{
          position: "absolute",
          left: "265px",
          top: "42px",
          width: "1159px",
          height: "84px",
          display: "flex",
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
            className={`nav-link ${active === l.href ? "active" : ""}`}
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

      {/* Mobile Toggle */}
      <button
        className="navbar__mobile-toggle md:hidden"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "absolute",
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          padding: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              display: "block",
              width: "24px",
              height: "1px",
              background: "var(--color-nav-text)",
              transition: "all 0.3s ease",
              transform: open ? "rotate(45deg) translateY(5px)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "16px",
              height: "1px",
              background: "var(--color-nav-text)",
              transition: "all 0.3s ease",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: "24px",
              height: "1px",
              background: "var(--color-nav-text)",
              transition: "all 0.3s ease",
              transform: open ? "rotate(-45deg) translateY(-5px)" : "none",
            }}
          />
        </div>
      </button>

      {/* Mobile Menu */}
      {open && (
        <div
          className="navbar__mobile-menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "var(--color-linen)",
            borderBottom: "1px solid var(--color-sand)",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            zIndex: 50,
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={`#${l.href}`}
              onClick={(e) => handleClick(e, l.href)}
              className={`nav-link ${active === l.href ? "active" : ""}`}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "18px",
                fontWeight: 300,
                color: "var(--color-nav-text)",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
