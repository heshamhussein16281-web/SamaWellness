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
    d: "M13.03 1H10.97C6.6 1 3 4.6 3 8.97v2.06c0 4.37 3.6 7.97 7.97 7.97h2.06c4.37 0 7.97-3.6 7.97-7.97V8.97C21 4.6 17.4 1 13.03 1zm0 14.5H10.97c-2.76 0-5-2.24-5-5v-2.06c0-2.76 2.24-5 5-5h2.06c2.76 0 5 2.24 5 5v2.06c0 2.76-2.24 5-5 5z M12 6.5c-3.03 0-5.5 2.47-5.5 5.5s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5zm0 9c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z M17.5 5.5c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z",
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
