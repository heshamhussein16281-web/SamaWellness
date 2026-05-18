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
   
   Scroll Detection:
   - Debounced scroll listener (150ms)
   - Detects which section user is viewing
   - Updates active nav item with smooth animation
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
 * 
 * Array of link objects with:
 *   label: Display text (UPPERCASE)
 *   href: Section ID (without #)
 * 
 * Used for:
 * - Desktop nav rendering
 * - Mobile menu rendering
 * - Scroll detection (matching section IDs)
 * - Click navigation
 */
const links = [
  { label: "HOME", href: "home" },
  { label: "OUR SERVICES", href: "services" },
  { label: "THE PROCESS", href: "process" },
  { label: "THE TEAM", href: "team" },
  { label: "CONTACT US", href: "contact" },
];

/**
 * Navbar — Main Navigation Component
 * 
 * State:
 *   open: Boolean for mobile menu visibility
 *   active: Currently active section (from scroll detection)
 * 
 * Effects:
 *   - Scroll listener with debouncing (150ms after scroll stops)
 *   - Detects section position relative to viewport
 *   - Updates active state only after scroll animation completes
 * 
 * Handlers:
 *   handleClick: Smooth scroll to section with active state lock
 *   handleScroll: Detects which section is in viewport
 * 
 * Layout:
 *   - Header: sticky, 175px tall, contains logo + nav
 *   - Logo: positioned absolutely, top-left with slight overlap
 *   - Desktop nav: absolutely positioned, 5 links with underline animation
 *   - Mobile toggle: hidden on desktop, shows hamburger icon
 *   - Mobile menu: dropdown overlay on click (hidden by default)
 * 
 * CSS Classes Used:
 *   .logo-link (LAYER 3: hover opacity)
 *   .nav-link (LAYER 3: underline animation, active state)
 *   .social-icon (if needed for mobile)
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let isScrollingProgrammatically = false;

    /**
     * handleScroll — Detects which section is currently visible
     * 
     * Logic:
     *   1. Skip if programmatic scroll is in progress (click navigation)
     *   2. Clear previous timer and start new one
     *   3. After 150ms (scroll has stopped), iterate sections from bottom to top
     *   4. Find first section above viewport midpoint (scrollY + 200px)
     *   5. Update active state
     * 
     * Why 200px offset? 
     *   - Header is 175px tall
     *   - 200px offset ensures active state changes when section passes header
     */
    const handleScroll = () => {
      if (isScrollingProgrammatically) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        const scrollY = window.scrollY + 200;
        
        // Iterate from last link to first (bottom to top)
        // This ensures we get the highest section that's still visible
        for (let i = links.length - 1; i >= 0; i--) {
          const el = document.getElementById(links[i].href);
          if (el && el.offsetTop <= scrollY) {
            setActive(links[i].href);
            break;
          }
        }
      }, 150);
    };

    /**
     * Lock mechanism: expose function for handleClick to toggle scrolling state
     * When user clicks a nav link, we lock scroll updates so active state
     * doesn't flicker during the smooth scroll animation.
     */
    (window as any).__setNavScrolling = (val: boolean) => {
      isScrollingProgrammatically = val;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  /**
   * handleClick — Navigate to section with smooth scroll
   * 
   * Steps:
   *   1. Prevent default link behavior
   *   2. Find target section element
   *   3. Lock scroll listener (prevent active state updates during animation)
   *   4. Set active state immediately
   *   5. Scroll smoothly to section (accounting for header height: 175px)
   *   6. Unlock scroll listener after animation (~900ms)
   *   7. Close mobile menu
   * 
   * Math:
   *   - el.offsetTop = absolute position of section in document
   *   - headerH = 175px (header height with scroll-margin-top)
   *   - top = el.offsetTop - headerH + 1 (account for header, +1 prevents overlap)
   */
  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) {
      const headerH = 175;
      const top = el.offsetTop - headerH + 1;
      
      // Lock scroll updates during smooth scroll animation
      (window as any).__setNavScrolling?.(true);
      setActive(href);
      
      // Smooth scroll
      window.scrollTo({ top, behavior: "smooth" });
      
      // Unlock after animation completes (~800ms smooth scroll + 100ms buffer = 900ms)
      setTimeout(() => {
        (window as any).__setNavScrolling?.(false);
      }, 900);
    }
    
    // Close mobile menu after navigation
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
      {/* ───────────────────────────────────
          Logo: Positioned absolutely, top-left
          ─────────────────────────────────── */}
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

      {/* ───────────────────────────────────
          Desktop Navigation (5 items, hidden on mobile)
          ─────────────────────────────────── */}
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
              borderBottom: active === l.href ? "1px solid var(--color-nav-text)" : "1px solid transparent",
              paddingBottom: "2px",
              WebkitFontSmoothing: "antialiased",
              padding: "4px 13.36px",
              cursor: "pointer",
              transition: "border-bottom-color 0.2s ease",
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* ───────────────────────────────────
          Mobile Toggle: Hamburger button (shown on mobile, hidden on desktop)
          ─────────────────────────────────── */}
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

      {/* ───────────────────────────────────
          Mobile Menu: Dropdown menu (shown when toggle is open)
          ─────────────────────────────────── */}
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
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "18px",
                fontWeight: 300,
                color: "var(--color-nav-text)",
                textTransform: "uppercase",
                borderBottom: active === l.href ? "1px solid var(--color-nav-text)" : "none",
                paddingBottom: active === l.href ? "4px" : "0",
                textDecoration: "none",
                transition: "all 0.2s ease",
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
