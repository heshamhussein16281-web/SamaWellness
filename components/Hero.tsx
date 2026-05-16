export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE YOUR MENTAL WELLNESS — top left */}
      <p style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(16px, 1.9vw, 32px)",
        fontWeight: 300,
        letterSpacing: "0.15em",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Left column — logo centered within it */}
      <div style={{
        position: "absolute",
        top: "80px",
        left: 0,
        width: "54.6%",
        bottom: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "40px",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-hero.png"
          alt="Sama Wellness Therapy"
          style={{
            width: "clamp(320px, 35vw, 543px)",
            height: "clamp(320px, 35vw, 543px)",
            objectFit: "contain",
            imageRendering: "high-quality",
          }}
        />

        {/* Professional Care tagline */}
        <p style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "clamp(24px, 2.6vw, 45px)",
          fontWeight: 300,
          color: "rgb(75, 99, 95)",
          textAlign: "center",
          marginTop: "32px",
          maxWidth: "600px",
          lineHeight: 1.3,
        }}>
          Professional Care Tailored to Your Journey
        </p>
      </div>

      {/* Room image — right column, starts at same level as ELEVATE text */}
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
