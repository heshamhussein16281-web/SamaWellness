"use client";
import { useState, useEffect } from "react";

const LOGO_URL = "/logo.png";

const links = [
  { label: "HOME", href: "#home" },
  { label: "OUR SERVICES", href: "#services" },
  { label: "THE PROCESS", href: "#process" },
  { label: "THE TEAM", href: "#team" },
  { label: "CONTACT US", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("HOME");

  useEffect(() => {
    const handleScroll = () => {
      const sections = links.map(l => ({
        label: l.label,
        el: document.querySelector(l.href) as HTMLElement,
      }));
      const scrollY = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].el && sections[i].el.offsetTop <= scrollY) {
          setActive(sections[i].label);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="w-full animate-fade-in"
      style={{
        height: "175px",
        position: "relative",
        backgroundColor: "#F5F2EE",
        borderBottom: "1px solid rgb(234, 228, 221)",
      }}
    >
      {/* Logo */}
      <a
        href="#home"
        style={{
          position: "absolute",
          top: "-7px",
          left: "-3px",
          display: "block",
          width: "182px",
          height: "182px",
          zIndex: 10,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", objectPosition: "center center", display: "block" }}
        />
      </a>

      {/* Desktop nav */}
      <nav
        className="hidden md:flex items-center"
        style={{ position: "absolute", left: "242px", top: "50%", transform: "translateY(-50%)", gap: "115px" }}
      >
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`nav-link ${active === l.label ? "active" : ""}`}
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "23px",
              fontWeight: 300,
              letterSpacing: "normal",
              color: "rgb(45, 74, 70)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button
        className="md:hidden absolute right-6 top-1/2 -translate-y-1/2 p-2"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <div className="flex flex-col gap-1.5">
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(45deg) translateY(5px)" : "none" }} />
          <span style={{ display: "block", width: "16px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translateY(-5px)" : "none" }} />
        </div>
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden absolute top-full left-0 right-0 z-50"
          style={{ backgroundColor: "#F5F2EE", borderBottom: "1px solid rgb(234,228,221)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "18px", fontWeight: 300, color: "rgb(45, 74, 70)", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
