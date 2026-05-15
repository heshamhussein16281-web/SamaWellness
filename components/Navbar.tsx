"use client";
import { useState, useEffect } from "react";
import clsx from "clsx";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={clsx("fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-linen", scrolled && "shadow-sm")}>
      <div className="max-w-7xl mx-auto px-8 py-2 flex items-center justify-between">
        <a href="#home">
          <Image src="/logo.png" alt="Sama Wellness Therapy" width={80} height={80} className="object-contain" />
        </a>
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
