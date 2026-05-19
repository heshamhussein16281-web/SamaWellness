"use client";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    image: "/initial-form.jpg",
    title: "Initial Screening Form",
  },
  {
    image: "/assessment.jpg",
    title: "15-Min assessment with counsellor Sama",
  },
  {
    image: "/matched-therapist.jpg",
    title: "Matched Therapist",
  },
];

export default function Process() {
  return (
    <section id="process" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div className="process-inner" style={{ width: "100%", padding: "0 12.7vw" }}>

        {/* Section heading */}
        <ScrollReveal>
          <h2 className="reveal" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 3.75vw, 64px)",
            fontWeight: 400,
            color: "rgb(45, 74, 70)",
            textAlign: "center",
            marginBottom: "72px",
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}>
            The Matching Process Simplified
          </h2>
        </ScrollReveal>

        {/* Steps grid — equal width columns with equal gaps */}
        <ScrollReveal>
          <div className="process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
            {steps.map((s, i) => (
              <div key={i} className="reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                {/* Icon box — light background with padding, icon centered inside */}
                <div style={{ backgroundColor: "#EAE4DD", padding: "40px 55px", marginBottom: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    style={{ width: "171px", height: "171px", objectFit: "contain", display: "block" }}
                  />
                </div>

                {/* Title — 37px, no description */}
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 2.2vw, 37px)",
                  fontWeight: 400,
                  color: "rgb(45, 74, 70)",
                  lineHeight: 1.25,
                  marginBottom: "0",
                }}>
                  {s.title}
                </h3>


              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
