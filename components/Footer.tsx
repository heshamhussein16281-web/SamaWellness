"use client";

export default function Footer() {
  return (
    <>
      {/* Subtle separator — replaces marquee */}
      <div className="footer-separator"></div>

      {/* Slim band footer — linen background */}
      <footer className="site-footer">
        <div className="footer__band">

          <a href="/" className="footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sama Wellness Therapy" className="footer__logo" />
            <span className="footer__brand-name">Sama Wellness Therapy</span>
          </a>

          {/* Tagline */}
          <p className="footer__tagline">Your Journey to Healing</p>

          {/* Contact info — email, phone, Instagram */}
          <div className="footer__contact">
            <a href="mailto:info@samawellnesstherapy.com" className="footer__contact-link">
              info@samawellnesstherapy.com
            </a>
            <span className="footer__contact-divider" aria-hidden="true">·</span>
            <a href="tel:+201130946556" className="footer__contact-link">
              (+2) 011 3094 6556
            </a>
            <span className="footer__contact-divider" aria-hidden="true">·</span>
            <a
              href="https://www.instagram.com/sama.wellness.therapy/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__contact-link"
            >
              @sama.wellness.therapy
            </a>
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
