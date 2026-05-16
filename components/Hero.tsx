export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE — exact: 32px, letterSpacing 4.81px, color rgb(45,74,70) */}
      <p style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(18px, 1.875vw, 32px)",
        fontWeight: 300,
        letterSpacing: "4.81px",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
        whiteSpace: "nowrap",
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Hero logo — 543×543px on 1710px = 31.7vw */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-hero.png"
        alt="Sama Wellness Therapy"
        style={{
          position: "absolute",
          top: "113px",
          left: "194px",
          width: "clamp(380px, 31.7vw, 543px)",
          height: "clamp(380px, 31.7vw, 543px)",
          objectFit: "contain",
        }}
      />

      {/* Professional Care — 45px, centered, rgb(75,99,95) */}
      <p style={{
        position: "absolute",
        top: "606px",
        left: "138px",
        width: "clamp(400px, 40vw, 684px)",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(28px, 2.65vw, 45px)",
        fontWeight: 300,
        color: "rgb(75, 99, 95)",
        textAlign: "center",
        margin: 0,
        lineHeight: 1.3,
      }}>
        Professional Care Tailored to Your Journey
      </p>

      {/* Room image — no rounding, no fade, exact match to original */}
      <div style={{
        position: "absolute",
        top: "38px",
        left: "54.6%",
        width: "673px",
        height: "671px",
        borderRadius: "10.7px",
        overflow: "clip",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/room.jpg"
          alt="Sama Wellness Therapy room"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "10.7px" }}
        />
      </div>

    </section>
  );
}
