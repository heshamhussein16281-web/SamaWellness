"use client";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    image: "/initial-form.jpg",
    title: "Initial Screening Form",
    showButton: true,
  },
  {
    image: "/assessment.jpg",
    title: "15-Min assessment with counsellor Sama",
    showButton: false,
  },
  {
    image: "/matched-therapist.jpg",
    title: "Matched Therapist",
    showButton: false,
  },
];

export default function Process() {
  return (
    <section id="process" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div style={{ width: "100%", padding: "0 12.7vw" }}>

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

        {/* Steps grid */}
        <ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 25.5%)", justifyContent: "space-between" }}>
            {steps.map((s, i) => (
              <div key={i} className="reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                {/* Icon — 171x171px, no background box */}
                <div style={{ width: "171px", height: "171px", marginBottom: "32px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>

                {/* Title — 37px, no description */}
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 2.2vw, 37px)",
                  fontWeight: 400,
                  color: "rgb(45, 74, 70)",
                  lineHeight: 1.25,
                  marginBottom: s.showButton ? "28px" : "0",
                }}>
                  {s.title}
                </h3>

                {/* Button only under step 1 */}
                {s.showButton && (
                  <a
                    href="https://ec1484c2-75c5-4118-9703-33fa4f397289.filesusr.com/ugd/c9c2af_54b7a2ba71d746f6bc234d84627a18a0.pages?dn=SWT%20Screening%20WD.pages"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      width: "350px",
                      padding: "16px 32px",
                      backgroundColor: "rgb(45, 74, 70)",
                      color: "#F5F2EE",
                      fontFamily: "var(--font-ui)",
                      fontSize: "22.7px",
                      fontWeight: 300,
                      letterSpacing: "normal",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      textAlign: "center",
                      borderRadius: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Open Initial Screening Form
                  </a>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
