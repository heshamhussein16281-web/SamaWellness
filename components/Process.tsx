"use client";
import { useEffect, useRef } from "react";

const steps = [
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="14" width="44" height="36" rx="2" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <line x1="10" y1="24" x2="54" y2="24" stroke="#7b2d3e" strokeWidth="1.2"/>
        <line x1="18" y1="34" x2="36" y2="34" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="18" y1="40" x2="30" y2="40" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Initial Screening Form",
    desc: "Complete our intake form so we can understand your needs and what you're seeking from therapy.",
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="28" cy="24" r="10" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <path d="M12 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <circle cx="46" cy="18" r="8" stroke="#4a6741" strokeWidth="1.2" fill="none"/>
        <line x1="46" y1="14" x2="46" y2="22" stroke="#4a6741" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="42" y1="18" x2="50" y2="18" stroke="#4a6741" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: "15-Min Assessment",
    desc: "A free consultation with counsellor Sama to discuss your goals and answer any questions.",
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="22" cy="24" r="10" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <path d="M6 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M38 30 L54 30 M48 24 L54 30 L48 36" stroke="#4a6741" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Matched Therapist",
    desc: "You're matched with the therapist whose specialization best fits your unique journey.",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("animate-fade-up"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" ref={ref} style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 64px" }}>

        <h2
          className="reveal"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(32px, 3.5vw, 52px)",
            fontWeight: 300,
            color: "#2c2c2c",
            textAlign: "center",
            marginBottom: "80px",
            letterSpacing: "0.01em",
            opacity: 0,
          }}
        >
          The Matching Process Simplified
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px", marginBottom: "64px" }}>
          {steps.map((s, i) => (
            <div
              key={i}
              className="reveal"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: 0, animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <div
                style={{ marginBottom: "28px", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {s.icon}
              </div>
              <div style={{ width: "32px", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "20px" }} />
              <h3 style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "11px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2c2c2c", marginBottom: "12px" }}>
                {s.title}
              </h3>
              <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "13px", fontWeight: 300, color: "rgba(44,44,44,0.6)", lineHeight: 1.8 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <a
            href="https://ec1484c2-75c5-4118-9703-33fa4f397289.filesusr.com/ugd/c9c2af_54b7a2ba71d746f6bc234d84627a18a0.pages?dn=SWT%20Screening%20WD.pages"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              border: "1px solid #7b2d3e",
              color: "#7b2d3e",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            <span>Open Initial Screening Form</span>
          </a>
        </div>
      </div>
    </section>
  );
}
