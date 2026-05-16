"use client";
import { useEffect, useRef } from "react";

const services = [
  {
    title: "Individual Therapy",
    desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    title: "Couple Therapy",
    desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
        <circle cx="16" cy="16" r="7" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <circle cx="32" cy="16" r="7" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <path d="M2 44c0-7.732 6.268-14 14-14" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M46 44c0-7.732-6.268-14-14-14" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M16 30c2.2-.6 4.6-.9 8-.9s5.8.3 8 .9" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    title: "Group Therapy",
    desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="10" r="6" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <circle cx="10" cy="22" r="6" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <circle cx="38" cy="22" r="6" stroke="#7b2d3e" strokeWidth="1.2" fill="none"/>
        <path d="M14 40c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M2 44c0-4.418 3.582-8 8-8" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M46 44c0-4.418-3.582-8-8-8" stroke="#7b2d3e" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
];

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("animate-fade-up");
          (e.target as HTMLElement).style.opacity = "1";
        }
      }),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    const els = ref.current?.querySelectorAll(".reveal") || [];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={ref} style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
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
          Healing Support &amp; Specialized Care
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "64px" }}>
          {services.map((s, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                opacity: 0,
                animationDelay: `${0.1 + i * 0.12}s`,
              }}
            >
              {/* Icon with subtle hover lift */}
              <div
                style={{ marginBottom: "24px", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {s.icon}
              </div>

              {/* Thin divider */}
              <div style={{ width: "32px", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "20px" }} />

              <h3 style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#2c2c2c",
                marginBottom: "16px",
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 300,
                color: "rgba(44,44,44,0.65)",
                lineHeight: 1.8,
              }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
