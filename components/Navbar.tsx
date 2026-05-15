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
    <header className="w-full bg-linen border-b border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
        <a href="#home">
          <Image src="/logo.png" alt="Sama Wellness Therapy" width={80} height={80} className="object-contain" />
        </a>
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l, i) => (
            <a key={l.href} href={l.href}
              className={`font-nav text-xs font-medium tracking-[0.15em] text-charcoal hover:text-burgundy-500 transition-colors ${i === 0 ? "underline underline-offset-4 text-burgundy-500" : ""}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <button className="md:hidden p-2" onClick={() => setOpen(v => !v)}>
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
              className="font-nav text-xs font-medium tracking-[0.15em] text-charcoal hover:text-burgundy-500">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
