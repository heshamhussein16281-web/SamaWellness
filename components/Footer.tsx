"use client";

const marqueeItems = Array(8).fill("SAMA WELLNESS THERAPY — YOUR JOURNEY TO HEALING —");

const socials = [
  { label: "Facebook", href: "http://www.facebook.com", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: "http://www.instagram.com", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "YouTube", href: "http://www.youtube.com", d: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
  { label: "X", href: "http://www.x.com", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", href: "http://www.linkedin.com", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "TikTok", href: "http://www.tiktok.com", d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
];

export default function Footer() {
  return (
    <>
      <div style={{ overflow: "hidden", backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", borderBottom: "1px solid rgb(234,228,221)", padding: "16px 0", userSelect: "none" }}>
        <div className="marquee-track">
          {marqueeItems.concat(marqueeItems).map((t, i) => (
            <span key={i} style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "11px", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(45,74,70)", whiteSpace: "nowrap", margin: "0 32px" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <footer style={{ backgroundColor: "#F5F2EE", padding: "64px 0 40px", borderTop: "1px solid rgb(234,228,221)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" }}>
          <a href="#home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sama Wellness Therapy" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
          </a>
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(44,44,44,0.55)", lineHeight: 2, textAlign: "center" }}>
            New Giza — B1-C031 Meditown, Cairo, Egypt<br />
            info@samawellnesstherapy.com &nbsp;·&nbsp; (+2) 011 309 46556
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
              </a>
            ))}
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(234,228,221)" }} />
          <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", fontWeight: 300, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(44,44,44,0.35)" }}>
            © {new Date().getFullYear()} Sama Wellness Therapy. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
