export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE YOUR MENTAL WELLNESS — exactly 38px from hero top, 131px from left */}
      <p style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(16px, 1.875vw, 32px)",
        fontWeight: 300,
        letterSpacing: "0.15em",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
        whiteSpace: "nowrap",
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Hero logo — 543px on 1710px = 31.7vw, top:113px, left:194px */}
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

      {/* Professional Care — top:606px from hero, left:138px, width:684px, centered, 45px */}
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

      {/* Room image — top:38px, left:54.6%, width:39.4%, height:671px */}
      <div className="img-zoom" style={{
        position: "absolute",
        top: "38px",
        left: "54.6%",
        width: "39.4%",
        height: "671px",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/room.jpg"
          alt="Sama Wellness Therapy room"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

    </section>
  );
}
