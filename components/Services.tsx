"use client";

// Original: 1054px section, cards 445x688, image 339x255 at offset 53/53
// Scale factor: 720/1054 = 0.683
// Scaled: cards 445x470, image 232x174 at offset 36/36
// Title offset: 351*0.683 = 240px, Desc offset: 481*0.683 = 329px
// Section heading: 64px → 44px, heading offset 51*0.683 = 35px
// Card gap: 80px (kept), side padding: 110*0.683 = 75px

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
        paddingTop: "35px",
        paddingBottom: "0px",
      }}
    >
      {/* Heading — scaled font, centered */}
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(28px, 2.57vw, 44px)",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        textAlign: "center",
        marginBottom: "24px",
        lineHeight: 1.15,
        padding: "0 75px",
      }}>
        Healing Support &amp; Specialized Care
      </h2>

      {/* Cards grid — 3 equal columns, 80px gap, 75px side padding */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "80px",
        paddingLeft: "75px",
        paddingRight: "75px",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#F5F2EE",
              position: "relative",
              height: "470px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* Image — 36px from top and left, fills width minus padding */}
            <div style={{
              position: "absolute",
              top: "36px",
              left: "36px",
              right: "36px",
              height: "174px",
              overflow: "hidden",
            }}>
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

            {/* Title — offset 240px from card top */}
            <h3 style={{
              position: "absolute",
              top: "240px",
              left: "36px",
              right: "36px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px, 1.76vw, 30px)",
              fontWeight: 400,
              color: "rgb(45, 74, 70)",
              lineHeight: 1.2,
              margin: 0,
            }}>
              {s.title}
            </h3>

            {/* Description — offset 330px from card top */}
            <p style={{
              position: "absolute",
              top: "330px",
              left: "36px",
              right: "36px",
              fontFamily: "var(--font-body)",
              fontSize: "clamp(12px, 1.1vw, 18px)",
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
