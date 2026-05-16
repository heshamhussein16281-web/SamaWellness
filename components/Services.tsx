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
        padding: "80px 60px",
      }}
    >
      {/* Section heading */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(32px, 3.75vw, 64px)",
          fontWeight: 300,
          color: "rgb(45, 74, 70)",
          margin: 0,
          lineHeight: 1.2,
        }}>
          Healing Support &amp; Specialized Care
        </h2>
      </div>

      {/* 3 cards with gaps, rounded corners, floating */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "24px",
        width: "100%",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#F5F2EE",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "32px",
              gap: "24px",
            }}
          >
            {/* Image with rounded corners, not full width */}
            <div style={{
              width: "100%",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                style={{
                  width: "100%",
                  height: "260px",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 2.65vw, 45px)",
              fontWeight: 300,
              color: "rgb(45, 74, 70)",
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "0.01em",
            }}>
              {s.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "clamp(14px, 1.2vw, 20px)",
              fontWeight: 300,
              color: "rgb(45, 74, 70)",
              lineHeight: 1.75,
              margin: 0,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
