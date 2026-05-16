export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE YOUR MENTAL WELLNESS */}
      <p style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(13px, 1.9vw, 32px)",
        fontWeight: 300,
        letterSpacing: "0.15em",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Big hero logo — 543x543px exact from original inspection, transparent PNG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-hero.png"
        alt="Sama Wellness Therapy"
        style={{
          position: "absolute",
          top: "113px",
          left: "194px",
          width: "clamp(240px, 31.7vw, 543px)",
          height: "clamp(240px, 31.7vw, 543px)",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />

      {/* Professional Care tagline */}
      <p style={{
        position: "absolute",
        top: "606px",
        left: "138px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(18px, 2.6vw, 45px)",
        fontWeight: 300,
        color: "rgb(75, 99, 95)",
        maxWidth: "684px",
        margin: 0,
        lineHeight: 1.3,
      }}>
        Professional Care Tailored to Your Journey
      </p>

      {/* Room image */}
      <div className="img-zoom" style={{ position: "absolute", top: "38px", left: "54.6%", width: "39.4%", height: "671px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/room.jpg" alt="Sama Wellness Therapy room" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>

    </section>
  );
}
