"use client";
const services = [
  {
    title: "Individual Therapy",
    desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
    image: "/individual-therapy.jpg",
  },
  {
    title: "Couple Therapy",
    desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
    image: "/couple-therapy.jpg",
  },
  {
    title: "Group Therapy",
    desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
    image: "/group-therapy.jpg",
  },
];

export default function Services() {
  return (
    <section id="services" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 64px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(32px, 3.5vw, 52px)",
          fontWeight: 300,
          color: "#2c2c2c",
          textAlign: "center",
          marginBottom: "80px",
          letterSpacing: "0.01em",
        }}>
          Healing Support &amp; Specialized Care
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px" }}>
          {services.map((s, i) => (
            <div
              key={i}
              className="animate-fade-up"
              style={{ display: "flex", flexDirection: "column", animationDelay: `${0.1 + i * 0.15}s` }}
            >
              {/* Image */}
              <div className="img-zoom" style={{ overflow: "hidden", marginBottom: "24px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.title}
                  style={{ width: "100%", height: "220px", objectFit: "cover", display: "block", transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </div>

              {/* Divider */}
              <div style={{ width: "32px", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "16px" }} />

              {/* Title */}
              <h3 style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#2c2c2c",
                marginBottom: "12px",
              }}>
                {s.title}
              </h3>

              {/* Description */}
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
