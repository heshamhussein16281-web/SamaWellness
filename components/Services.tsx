"use client";

// Exact measurements from live inspection of samawellnesstherapy.com
// Card: 445.45 x 687.95px, bg #F5F2EE, no border radius
// Section bg: rgb(234,228,221), side padding 110px, gap between cards 80px
// Image: 339x255px, 53px from card edges
// Title: topOffset 351px, 53px from left, 45px font, lineHeight 54.5px
// Desc: topOffset 481px, 53px from left, 22.7px font, lineHeight 29.5px

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
        paddingTop: "80px",
        paddingBottom: "80px",
      }}
    >
      {/* Section heading */}
      <div style={{ textAlign: "center", marginBottom: "60px", paddingLeft: "110px", paddingRight: "110px" }}>
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

      {/* Cards container — exactly 110px padding each side, 80px gap */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 445.45px)",
        gap: "80px",
        paddingLeft: "110px",
        paddingRight: "104px",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              width: "445.45px",
              height: "687.95px",
              backgroundColor: "#F5F2EE",
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Image — 339x255px, 53px from top and left */}
            <div
              style={{
                position: "absolute",
                top: "53px",
                left: "53px",
                width: "339px",
                height: "255px",
                overflow: "hidden",
              }}
            >
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

            {/* Title — 351px from card top, 53px from left */}
            <h3 style={{
              position: "absolute",
              top: "351px",
              left: "53px",
              right: "53px",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "45px",
              fontWeight: 300,
              color: "rgb(45, 74, 70)",
              lineHeight: "54.5px",
              margin: 0,
              letterSpacing: "0.01em",
            }}>
              {s.title}
            </h3>

            {/* Description — 481px from card top, 53px from left */}
            <p style={{
              position: "absolute",
              top: "481px",
              left: "53px",
              right: "53px",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "22.7px",
              fontWeight: 300,
              color: "rgb(45, 74, 70)",
              lineHeight: "29.5px",
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
