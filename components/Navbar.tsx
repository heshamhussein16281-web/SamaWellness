"use client";
import { useState, useEffect } from "react";
import clsx from "clsx";

const links = [
  { label: "HOME", href: "#home" },
  { label: "OUR SERVICES", href: "#services" },
  { label: "THE PROCESS", href: "#process" },
  { label: "THE TEAM", href: "#team" },
  { label: "CONTACT US", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={clsx("fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-linen", scrolled && "shadow-sm")}>
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <a href="#home"><LogoMark /></a>
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="font-nav text-xs font-medium tracking-[0.15em] text-charcoal hover:text-burgundy-500 hover:underline underline-offset-4 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <button className="md:hidden p-2" onClick={() => setOpen(v => !v)}>
          <div className="flex flex-col gap-1.5">
            <span className={clsx("block w-6 h-0.5 bg-charcoal transition-all", open && "rotate-45 translate-y-2")} />
            <span className={clsx("block w-4 h-0.5 bg-charcoal transition-all", open && "opacity-0")} />
            <span className={clsx("block w-6 h-0.5 bg-charcoal transition-all", open && "-rotate-45 -translate-y-2")} />
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

export function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <svg width="55" height="68" viewBox="0 0 55 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="27" cy="22" rx="14" ry="17" stroke="#7b2d3e" strokeWidth="1.8" fill="none"/>
        <path d="M20 38 Q27 42 34 38" stroke="#7b2d3e" strokeWidth="1.8" fill="none"/>
        <rect x="22" y="40" width="10" height="5" rx="1" stroke="#7b2d3e" strokeWidth="1.8" fill="none"/>
        <line x1="27" y1="38" x2="27" y2="20" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M27 32 C27 32 20 30 19 24 C23 24 27 28 27 32Z" fill="#4a6741"/>
        <path d="M27 29 C27 29 34 27 35 21 C31 21 27 25 27 29Z" fill="#4a6741"/>
        <path d="M27 24 C27 24 25 18 27 14 C29 18 27 24 27 24Z" fill="#4a6741"/>
      </svg>
      <div>
        <p className="font-display text-burgundy-500 text-lg font-semibold leading-tight">Sama</p>
        <p className="font-display text-burgundy-500 text-lg font-semibold leading-tight">Wellness</p>
        <p className="font-display text-burgundy-500 text-lg font-semibold leading-tight">Therapy</p>
      </div>
    </div>
  );
}
