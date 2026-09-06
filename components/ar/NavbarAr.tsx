/* Arabic Navbar — RTL version with language switcher */
"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { label: "الرئيسية", href: "/ar" },
  { label: "خدماتنا", href: "/ar/services" },
  { label: "الفريق", href: "/ar/team" },
  { label: "الغرف", href: "/ar/rooms" },
  { label: "المدونة", href: "/ar/blog" },
  { label: "الأسئلة الشائعة", href: "/ar/ask" },
];

export default function NavbarAr() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/ar") return pathname === "/ar";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="navbar"
      style={{
        height: "175px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--color-linen)",
        borderBottom: "1px solid var(--color-sand)",
        width: "100%",
        overflow: "visible",
      }}
    >
      {/* Logo — flipped to right for RTL */}
      <Link
        href="/ar"
        className="navbar__logo-link logo-link"
        style={{
          position: "absolute",
          top: "-7px",
          display: "block",
          width: "182px",
          height: "182px",
          zIndex: 10,
        }}
      >
        <img
          src="/logo.png"
          alt="ساما ويلنس ثيرابي"
          style={{
            width: "182px",
            height: "182px",
            objectFit: "contain",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </Link>

      {/* Desktop nav */}
      <nav
        className="navbar__desktop-nav"
        style={{
          position: "absolute",
          top: "42px",
          height: "84px",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: "32px",
          rowGap: "12px",
        }}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link${isActive(l.href) ? " active" : ""}`}
            style={{
              fontFamily: "var(--font-tajawal)",
              fontSize: "21px",
              fontWeight: 400,
              lineHeight: "29.52px",
              letterSpacing: "0",
              color: "var(--color-nav-text)",
              whiteSpace: "nowrap",
              textDecoration: "none",
              padding: "4px 13.36px",
              cursor: "pointer",
            }}
          >
            {l.label}
          </Link>
        ))}

        {/* Language switcher */}
        <Link href="/" className="lang-switch" title="Switch to English">
          EN
        </Link>
      </nav>

      {/* Mobile language switch — always visible next to burger */}
      <Link
        href="/"
        className="navbar__mobile-lang"
        aria-label="English"
        style={{
          position: "absolute",
          left: "60px",
          top: "65px",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          fontWeight: 400,
          color: "var(--color-nav-text)",
          textDecoration: "none",
          border: "1px solid var(--color-sand)",
          borderRadius: "6px",
          padding: "5px 10px",
          lineHeight: 1,
          letterSpacing: "0.03em",
          display: "none",
        }}
      >
        EN
      </Link>

      {/* Mobile toggle — flipped to left for RTL */}
      <button
        className="navbar__mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
      >
        <span
          className="navbar__burger-bar"
          style={{ transform: open ? "rotate(45deg) translateY(7px)" : "none" }}
        />
        <span
          className="navbar__burger-bar navbar__burger-bar--mid"
          style={{ opacity: open ? 0 : 1 }}
        />
        <span
          className="navbar__burger-bar"
          style={{
            transform: open ? "rotate(-45deg) translateY(-7px)" : "none",
          }}
        />
      </button>

      {/* Mobile menu */}
      {open && (
        <>
          <div
            className="navbar__mobile-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="navbar__mobile-menu">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`nav-link navbar__mobile-link${isActive(l.href) ? " active" : ""}`}
                style={{ fontFamily: "var(--font-tajawal)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
