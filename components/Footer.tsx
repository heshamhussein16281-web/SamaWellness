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
