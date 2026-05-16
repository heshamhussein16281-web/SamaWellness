import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    image: "/initial-form.jpg",
    title: "Initial Screening Form",
    desc: "Complete our intake form so we can understand your needs and what you're seeking from therapy.",
  },
  {
    image: "/assessment.jpg",
    title: "15-Min Assessment",
    desc: "A free consultation with counsellor Sama to discuss your goals and answer any questions.",
  },
  {
    image: "/matched-therapist.jpg",
    title: "Matched Therapist",
    desc: "You're matched with the therapist whose specialization best fits your unique journey.",
  },
];

export default function Process() {
  return (
    <section id="process" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 64px" }}>

        <ScrollReveal>
          <h2 className="reveal" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 3.75vw, 64px)",
            fontWeight: 400,
            color: "rgb(45, 74, 70)",
            textAlign: "center",
            marginBottom: "80px",
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}>
            The Matching Process Simplified
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px", marginBottom: "64px" }}>
            {steps.map((s, i) => (
              <div key={i} className="reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                {/* Icon image */}
                <div style={{ width: "120px", height: "120px", marginBottom: "32px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>

                {/* Thin divider */}
                <div style={{ width: "32px", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "20px" }} />

                {/* Title */}
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 1.8vw, 30px)",
                  fontWeight: 400,
                  color: "rgb(45, 74, 70)",
                  marginBottom: "14px",
                  lineHeight: 1.2,
                }}>
                  {s.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(14px, 1.1vw, 18px)",
                  fontWeight: 300,
                  color: "rgba(44,44,44,0.65)",
                  lineHeight: 1.8,
                }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA Button */}
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
              fontFamily: "var(--font-ui)",
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Open Initial Screening Form
          </a>
        </div>

      </div>
    </section>
  );
}
