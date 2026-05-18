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
    <section
      id="services"
      style={{
        backgroundColor: "rgb(234, 228, 221)",
        width: "100%",
        padding: "60px 40px",
        minHeight: "800px",
      }}
    >
      {/* Heading */}
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 2.57vw, 44px)",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        textAlign: "center",
        marginBottom: "48px",
        lineHeight: 1.15,
      }}>
        Healing Support &amp; Specialized Care
      </h2>

      {/* Cards grid — equal padding, white cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "40px",
        alignItems: "stretch",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Image — rounded corners at top */}
            <div style={{ overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Text content with padding */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, padding: "28px 24px" }}>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 1.76vw, 30px)",
                fontWeight: 400,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.3,
                margin: 0,
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(14px, 1vw, 16px)",
                fontWeight: 300,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
