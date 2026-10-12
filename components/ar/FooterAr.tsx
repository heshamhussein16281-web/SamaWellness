"use client";
import Link from "next/link";

export default function FooterAr() {
  return (
    <>
      <div className="footer-separator"></div>
      <footer className="site-footer">
        <div className="footer__band">
          <Link href="/ar" className="footer__brand">
            <img src="/logo.png" alt="ساما ويلنس ثيرابي" className="footer__logo" />
            <span className="footer__brand-name">Sama Wellness Therapy</span>
          </Link>
          <p className="footer__tagline">رحلتك نحو التعافي</p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Meditown+B1+C031+New+Giza+Giza+Governorate+12588"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__address"
            dir="ltr"
          >
            ميدتاون - B1 - C031، نيو جيزة، محافظة الجيزة 12588
          </a>

          <div className="footer__contact">
            <a href="mailto:info@samawellnesstherapy.com" className="footer__contact-link">
              info@samawellnesstherapy.com
            </a>
            <span className="footer__contact-divider" aria-hidden="true">·</span>
            <a href="tel:+201130946556" className="footer__contact-link" dir="ltr">
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
              © {new Date().getFullYear()} Sama Wellness Therapy. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
