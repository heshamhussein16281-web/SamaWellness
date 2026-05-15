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
    <header className="w-full bg-linen">
      <div className="flex items-center px-8 py-3 min-h-[110px]">
        {/* Logo */}
        <a href="#home" className="flex flex-col items-center shrink-0 mr-20">
          <Image src="/logo.png" alt="Sama Wellness Therapy" width={52} height={52} className="object-contain" priority />
          <div className="text-center mt-1 leading-tight">
            <span className="block font-display text-[14px] font-normal text-[#3d3226]">Sama</span>
            <span className="block font-display text-[14px] font-normal text-[#3d3226]">Wellness</span>
            <span className="block font-display text-[14px] font-normal text-[#3d3226]">Therapy</span>
          </div>
        </a>

        {/* Desktop nav — fixed 115px gap between items */}
        <nav className="hidden md:flex items-center" style={{ gap: "115px" }}>
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 300,
                letterSpacing: "0.06em",
                color: "rgb(45, 74, 70)",
                textTransform: "uppercase",
                textDecoration: i === 0 ? "underline" : "none",
                textUnderlineOffset: "5px",
                whiteSpace: "nowrap",
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobile toggle */}
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
