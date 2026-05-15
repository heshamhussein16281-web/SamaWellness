"use client";
import { useState } from "react";
import Image from "next/image";

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
    <header className="w-full bg-linen" style={{ minHeight: "175px", position: "relative", overflow: "visible" }}>
      <div className="flex items-center" style={{ minHeight: "175px", paddingLeft: "24px", paddingRight: "40px" }}>

        {/* Logo — 182x182, top-left, slight negative margin matching original */}
        <a href="#home" className="shrink-0" style={{ marginTop: "-7px", marginLeft: "-3px", marginRight: "80px" }}>
          <Image
            src="/logo.png"
            alt="Sama Wellness Therapy"
            width={182}
            height={182}
            style={{ display: "block", objectFit: "contain", objectPosition: "center" }}
            priority
          />
        </a>

        {/* Nav — fixed 115px gap, vertically centered */}
        <nav className="hidden md:flex items-center" style={{ gap: "115px" }}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 300,
              letterSpacing: "0.06em",
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

        <button className="md:hidden ml-auto p-2" onClick={() => setOpen(v => !v)}>
          <div className="flex flex-col gap-1.5">
            <span className="block w-6 h-0.5 bg-charcoal" />
            <span className="block w-4 h-0.5 bg-charcoal" />
            <span className="block w-6 h-0.5 bg-charcoal" />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-linen px-8 py-6 flex flex-col gap-5 border-t border-burgundy-100">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "15px", fontWeight: 300, color: "rgb(45, 74, 70)", textTransform: "uppercase" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
