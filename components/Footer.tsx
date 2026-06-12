"use client";

const socialLinks = [
  { label: "Email", href: "mailto:info@samawellnesstherapy.com", icon: "✉️" },
  { label: "Phone", href: "tel:+201130946556", icon: "📱" },
  { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=201130946556", icon: "💬" },
  { label: "Instagram", href: "https://www.instagram.com/sama.wellness.therapy/", icon: "📷" },
];

export default function Footer() {
  return (
    <>
      {/* Subtle separator — replaces marquee */}
      <div className="footer-separator"></div>

      {/* Slim band footer — linen background */}
      <footer className="site-footer">
        <div className="footer__band">

          <a href="#home" className="footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sama Wellness Therapy" className="footer__logo" />
            <span className="footer__brand-name">Sama Wellness Therapy</span>
          </a>

          {/* Social Links */}
          <div className="footer__socials">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                title={link.label}
                className="footer__social-link"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {link.icon}
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
