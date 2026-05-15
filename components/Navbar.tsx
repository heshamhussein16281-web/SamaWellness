"use client";
import { useState } from "react";
import Image from "next/image";

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
    <header className="w-full bg-linen">
      <div className="w-full px-12 py-4 flex items-center">
        {/* Logo — larger, matches original */}
        <a href="#home" className="shrink-0 mr-16">
          <Image
            src="/logo.png"
            alt="Sama Wellness Therapy"
            width={110}
            height={110}
            className="object-contain"
            priority
          />
        </a>

        {/* Nav items — evenly spaced, serif font, title case */}
        <nav className="hidden md:flex flex-1 items-center justify-between">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-display text-base font-normal tracking-wide text-charcoal hover:text-burgundy-500 transition-colors whitespace-nowrap ${
                i === 0 ? "underline underline-offset-4 decoration-1 text-burgundy-500" : ""
              }`}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-linen px-12 py-6 flex flex-col gap-5 border-t border-burgundy-100">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-base font-normal text-charcoal hover:text-burgundy-500"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
