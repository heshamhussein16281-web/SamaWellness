"use client";
import { useState } from "react";

const LOGO_URL = "https://static.wixstatic.com/media/c9c2af_737fbe5934df446dbf671e28c6103fd6~mv2.png";

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
    <header className="w-full" style={{ height: "175px", position: "relative", backgroundColor: "#F5F2EE", borderBottom: "1px solid rgb(234, 228, 221)" }}>

      {/* Logo — 182x182, exact position from original */}
      <a href="#home" style={{ position: "absolute", top: "-7px", left: "-3px", display: "block", width: "182px", height: "182px", zIndex: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", objectPosition: "center center", display: "block" }} />
      </a>

      {/* Nav — exact font size 23px, vertically centered */}
      <nav className="hidden md:flex items-center" style={{
        position: "absolute",
        left: "242px",
        top: "50%",
        transform: "translateY(-50%)",
        gap: "115px",
      }}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "23px",
            fontWeight: 300,
            letterSpacing: "normal",
            color: "rgb(45, 74, 70)",
            textTransform: "uppercase",
            textDecoration: i === 0 ? "underline" : "none",
            textUnderlineOffset: "5px",
            whiteSpace: "nowrap",
          }}>
            {l.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button className="md:hidden absolute right-6 top-1/2 -translate-y-1/2 p-2" onClick={() => setOpen(v => !v)}>
        <div className="flex flex-col gap-1.5">
          <span className="block w-6 h-0.5 bg-charcoal" />
          <span className="block w-4 h-0.5 bg-charcoal" />
          <span className="block w-6 h-0.5 bg-charcoal" />
        </div>
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-linen px-8 py-6 flex flex-col gap-5 border-t border-burgundy-100 z-50">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "23px", fontWeight: 300, color: "rgb(45, 74, 70)", textTransform: "uppercase" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
