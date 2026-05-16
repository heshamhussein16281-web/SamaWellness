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
        paddingTop: "40px",
        paddingBottom: "32px",
      }}
    >
      {/* Section heading */}
      <div style={{ textAlign: "center", marginBottom: "32px", paddingLeft: "80px", paddingRight: "80px" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3.04vw, 52px)",
          fontWeight: 400,
          color: "rgb(45, 74, 70)",
          margin: 0,
          lineHeight: 1.2,
        }}>
          Healing Support &amp; Specialized Care
        </h2>
      </div>

      {/* Cards — exact 445.45px wide, 530px tall, 80px side padding, 80px gap */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 445.45px)",
        gap: "80px",
        paddingLeft: "80px",
        paddingRight: "80px",
      }}>
        {services.map((s, i) => (
          <div
            key={i}
            style={{
              width: "445.45px",
              height: "530px",
              backgroundColor: "#F5F2EE",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Image — scaled proportionally: original 255/688 ratio → 196/530 */}
            <div style={{ position: "absolute", top: "40px", left: "40px", width: "365px", height: "196px", overflow: "hidden" }}>
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

            {/* Title — scaled: original top 351/688 ratio → 270/530 */}
            <h3 style={{
              position: "absolute",
              top: "270px",
              left: "40px",
              right: "40px",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 2.2vw, 37px)",
              fontWeight: 400,
              color: "rgb(45, 74, 70)",
              lineHeight: 1.2,
              margin: 0,
            }}>
              {s.title}
            </h3>

            {/* Description — scaled: original top 481/688 ratio → 370/530 */}
            <p style={{
              position: "absolute",
              top: "370px",
              left: "40px",
              right: "40px",
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
        ))}
      </div>
    </section>
  );
}
