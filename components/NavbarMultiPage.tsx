/* ========================================
   NAVBAR MULTI-PAGE COMPONENT

   Same visual design as the single-page Navbar
   but uses Next.js Link for page navigation
   instead of anchor-scroll.

   Active state based on current pathname.
   ======================================== */

"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { label: "HOME",         href: "/"         },
  { label: "OUR SERVICES", href: "/services" },
  { label: "THE TEAM",     href: "/team"     },
  { label: "ROOMS",        href: "/rooms"    },
  { label: "BLOG",         href: "/blog"     },
  { label: "FAQ & ASK SAMA", href: "/ask"    },
];

export default function NavbarMultiPage() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
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

      {/* Logo */}
      <Link
        href="/"
        className="navbar__logo-link logo-link"
        style={{
          position: "absolute",
          top: "-7px",
          left: "-3px",
          display: "block",
          width: "182px",
          height: "182px",
          zIndex: 10,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Sama Wellness Therapy"
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
          left: "265px",
          top: "42px",
          width: "1159px",
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
              fontFamily: "var(--font-ui)",
              fontSize: "22.7px",
              fontWeight: 300,
              lineHeight: "29.52px",
              letterSpacing: "-0.02em",
              color: "var(--color-nav-text)",
              textTransform: "uppercase",
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
        <Link
          href="/ar"
          className="lang-switch"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "0.05em",
            color: "var(--color-nav-text)",
            textDecoration: "none",
            border: "1px solid var(--color-nav-text)",
            borderRadius: "4px",
            padding: "4px 12px",
            whiteSpace: "nowrap",
            marginLeft: "8px",
          }}
        >
          عربي
        </Link>

      </nav>

      {/* Mobile toggle */}
      <button
        className="navbar__mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
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
          style={{ transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }}
        />
      </button>

      {/* Mobile menu dropdown */}
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
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/ar"
              onClick={() => setOpen(false)}
              className="nav-link navbar__mobile-link"
              style={{ fontFamily: "var(--font-tajawal, var(--font-ui))" }}
            >
              عربي
            </Link>
          </div>
        </>
      )}

    </header>
  );
}
