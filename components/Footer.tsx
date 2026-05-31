"use client";

const marqueeItems = Array(16).fill("SAMA WELLNESS THERAPY — YOUR JOURNEY TO HEALING —");

const navLinks = [
  { label: "Home",        href: "#home" },
  { label: "Services",    href: "#services" },
  { label: "The Process", href: "#process" },
  { label: "The Team",    href: "#team" },
  { label: "Rooms",       href: "#rooms" },
  { label: "Contact",     href: "#contact" },
];

interface SocialLink {
  label: string;
  href: string;
  d: string;
}

const socials: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sama.wellness.therapy/",
    d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z",
  },
];

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
                aria-label={s.label} className="footer__social-link footer__social-link--instagram">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="5%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </linearGradient>
                  </defs>
                  <path d={s.d} fill="url(#ig-gradient)" />
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
