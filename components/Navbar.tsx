"use client";
import { useState } from "react";

const links = [
  { label: "HOME", href: "#home" },
  { label: "OUR SERVICES", href: "#services" },
  { label: "THE PROCESS", href: "#process" },
  { label: "THE TEAM", href: "#team" },
  { label: "CONTACT US", href: "#contact" },
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
      overflow: "visible",
    }}>
      {/* Logo — 182x182, slight negative top matching original */}
      <a href="#home" style={{ position: "absolute", top: "-7px", left: "-3px", display: "block", width: "182px", height: "182px", zIndex: 10 }} className="logo-link">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", objectPosition: "center center", display: "block" }} />
      </a>

      {/* Desktop nav — starts at 242px, spans to right edge, items evenly spread */}
      {/* Original nav: left:242px, width:1159px on 1710px viewport = justify-content:space-between */}
      <nav className="hidden md:flex items-center" style={{
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
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className=""
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "22.7px",
              fontWeight: 300,
              lineHeight: "29.52px",
              letterSpacing: "-0.02em",
              color: "rgb(45, 74, 70)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textDecoration: i === 0 ? "underline" : "none",
              textDecorationColor: "rgb(45, 74, 70)",
              textUnderlineOffset: "auto",
              WebkitFontSmoothing: "antialiased",
              padding: "4px 13.36px",
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
