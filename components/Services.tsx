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
        padding: "60px 32px",
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

      {/* Cards — equal height, larger gap, image inset */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "32px",
        alignItems: "stretch",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#F5F2EE",
              display: "flex",
              flexDirection: "column",
              padding: "32px",
            }}
          >
            {/* Image — inset with padding around it */}
            <div style={{ overflow: "hidden", marginBottom: "24px", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Text — flex-grow so all cards stretch to same height */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(18px, 1.76vw, 30px)",
                fontWeight: 400,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.2,
                margin: 0,
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(13px, 1vw, 17px)",
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
