"use client";
import { useState, useEffect } from "react";

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
      // Only update active state after scroll stops (not during smooth scroll animation)
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

    // Expose setter so handleClick can lock scroll updates during animation
    (window as any).__setNavScrolling = (val: boolean) => { isScrollingProgrammatically = val; };

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
      // Lock scroll listener during animation, set active immediately on click
      (window as any).__setNavScrolling?.(true);
      setActive(href);
      window.scrollTo({ top, behavior: "smooth" });
      // Unlock after animation completes (~800ms)
      setTimeout(() => { (window as any).__setNavScrolling?.(false); }, 900);
    }
    setOpen(false);
  };

  return (
    <header style={{
      height: "175px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "#F5F2EE",
      borderBottom: "1px solid rgb(234, 228, 221)",
      width: "100%",
      overflow: "visible",
    }}>
      {/* Logo */}
      <a href="#home" onClick={e => handleClick(e, "home")} style={{ position: "absolute", top: "-7px", left: "-3px", display: "block", width: "182px", height: "182px", zIndex: 10 }} className="logo-link">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", objectPosition: "center center", display: "block" }} />
      </a>

      {/* Desktop nav */}
      <nav className="hidden md:flex" style={{
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
      }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={`#${l.href}`}
            onClick={e => handleClick(e, l.href)}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "22.7px",
              fontWeight: 300,
              lineHeight: "29.52px",
              letterSpacing: "-0.02em",
              color: "rgb(45, 74, 70)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textDecoration: "none",
              borderBottom: active === l.href ? "1px solid rgb(45, 74, 70)" : "1px solid transparent",
              paddingBottom: "2px",
              WebkitFontSmoothing: "antialiased",
              padding: "4px 13.36px",
              cursor: "pointer",
              transition: "text-decoration 0.2s ease",
            }}>
            {l.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button className="md:hidden" style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", padding: "8px", background: "none", border: "none", cursor: "pointer" }}
        onClick={() => setOpen(v => !v)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(45deg) translateY(5px)" : "none" }} />
          <span style={{ display: "block", width: "16px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translateY(-5px)" : "none" }} />
        </div>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#F5F2EE", borderBottom: "1px solid rgb(234,228,221)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", zIndex: 50 }}>
          {links.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={e => handleClick(e, l.href)}
              style={{ fontFamily: "var(--font-ui)", fontSize: "18px", fontWeight: 300, color: "rgb(45, 74, 70)", textTransform: "uppercase", borderBottom: active === l.href ? "1px solid rgb(45, 74, 70)" : "none" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
