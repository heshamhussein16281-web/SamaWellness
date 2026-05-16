"use client";
import { useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Our Services", href: "#services" },
  { label: "The Process", href: "#process" },
  { label: "The Team", href: "#team" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      height: "175px",
      position: "relative",
      backgroundColor: "#F5F2EE",
      borderBottom: "1px solid rgb(234, 228, 221)",
      width: "100%",
    }}>
      {/* Logo */}
      <a href="#home" style={{ position: "absolute", top: "-7px", left: "-3px", display: "block", width: "182px", height: "182px", zIndex: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", objectPosition: "center center", display: "block" }} />
      </a>

      {/* Desktop nav — exact match to original */}
      <nav className="hidden md:flex items-center" style={{
        position: "absolute",
        left: "242px",
        top: "42px",
        gap: "0px", // gap handled by item padding like original
      }}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} className={`nav-link ${i === 0 ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 13.36px",      // exact from inspection
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "22.7px",           // exact from inspection
              fontWeight: 300,
              lineHeight: "29.52px",        // exact from inspection
              letterSpacing: "normal",
              color: "rgb(45, 74, 70)",
              textTransform: "uppercase",   // exact from inspection
              whiteSpace: "nowrap",
              textDecoration: "none",
              WebkitFontSmoothing: "antialiased",
            }}>
            {l.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button className="md:hidden" style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", padding: "8px", background: "none", border: "none", cursor: "pointer" }}
        onClick={() => setOpen(v => !v)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)" }} />
          <span style={{ display: "block", width: "16px", height: "1px", background: "rgb(45,74,70)" }} />
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)" }} />
        </div>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#F5F2EE", borderBottom: "1px solid rgb(234,228,221)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", zIndex: 50 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "22.7px", fontWeight: 300, color: "rgb(45, 74, 70)", textTransform: "uppercase" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
