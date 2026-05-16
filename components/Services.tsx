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
        padding: "28px 6.4% 24px",
      }}
    >
      {/* Heading */}
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 2.57vw, 44px)",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        textAlign: "center",
        marginBottom: "20px",
        lineHeight: 1.15,
      }}>
        Healing Support &amp; Specialized Care
      </h2>

      {/* Cards — auto height, shrinks to content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
        alignItems: "start",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#F5F2EE",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Image — fixed 155px height */}
            <div style={{ flexShrink: 0, height: "155px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Text body — shrinks to content with small padding */}
            <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(16px, 1.76vw, 30px)",
                fontWeight: 400,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.2,
                margin: 0,
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(12px, 1vw, 16px)",
                fontWeight: 300,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.75,
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
