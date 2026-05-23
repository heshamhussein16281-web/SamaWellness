"use client";

const marqueeItems = Array(16).fill("SAMA WELLNESS THERAPY — YOUR JOURNEY TO HEALING —");

const navLinks = [
  { label: "Home",        href: "#home" },
  { label: "Services",    href: "#services" },
  { label: "The Process", href: "#process" },
  { label: "The Team",    href: "#team" },
  { label: "Contact",     href: "#contact" },
];

const socials = [];

export default function Footer() {
  return (
    <>
      {/* Marquee — dark teal background */}
      <div className="footer-marquee-wrap">
        <div className="marquee-track">
          {marqueeItems.map((t, i) => (
            <span key={i} className="footer-marquee-item">{t}</span>
          ))}
        </div>
      </div>

      {/* Slim band footer — linen background */}
      <footer className="site-footer">
        <div className="footer__band">

          <a href="#home" className="footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sama Wellness Therapy" className="footer__logo" />
            <span className="footer__brand-name">Sama Wellness Therapy</span>
          </a>

          <ul className="footer__nav">
            {navLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="footer__nav-link">{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="footer__socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label} className="footer__social-link">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>

        </div>

        <div className="footer__bottom">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">
              © {new Date().getFullYear()} Sama Wellness Therapy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
