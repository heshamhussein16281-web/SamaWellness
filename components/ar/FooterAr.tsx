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
