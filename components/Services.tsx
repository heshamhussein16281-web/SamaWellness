"use client";

// Section bg: rgb(234, 228, 221) = color(srgb 0.917647 0.894118 0.866667)
// Card bg: rgb(245, 242, 238) = #F5F2EE (lighter than section)
// Title: 45px, weight 300, color rgb(45,74,70)
// Desc: 22.7px, weight 300, color rgb(45,74,70)
// Layout: 3 full-height vertical strips, no gap, no max-width container

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
      }}
    >
      {/* Section heading */}
      <div style={{ width: "100%", textAlign: "center", paddingTop: "80px", paddingBottom: "60px" }}>
        <h2 style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "clamp(36px, 3.75vw, 64px)",
          fontWeight: 300,
          color: "rgb(45, 74, 70)",
          letterSpacing: "normal",
          margin: 0,
          lineHeight: 1.2,
        }}>
          Healing Support &amp; Specialized Care
        </h2>
      </div>

      {/* 3 full-width vertical strip cards, no gap */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        width: "100%",
        gap: 0,
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#F5F2EE",
              display: "flex",
              flexDirection: "column",
              borderRight: i < 2 ? "1px solid rgb(234, 228, 221)" : "none",
            }}
          >
            {/* Image — fills top of card */}
            <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", flexShrink: 0 }}>
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

            {/* Text content below image */}
            <div style={{ padding: "40px 40px 60px" }}>
              <h3 style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "clamp(28px, 2.65vw, 45px)",
                fontWeight: 300,
                color: "rgb(45, 74, 70)",
                margin: "0 0 24px 0",
                lineHeight: 1.2,
                letterSpacing: "normal",
              }}>
                {s.title}
              </h3>
              <p style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "clamp(15px, 1.33vw, 22.7px)",
                fontWeight: 300,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.7,
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
