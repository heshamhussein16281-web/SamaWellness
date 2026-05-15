const LOGO_URL = "https://static.wixstatic.com/media/c9c2af_737fbe5934df446dbf671e28c6103fd6~mv2.png";
const ROOM_URL = "/room.jpg";

export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "55% 45%", minHeight: "987px" }}>

        {/* Left column */}
        <div style={{ position: "relative", padding: "38px 0 60px 131px" }}>

          {/* ELEVATE YOUR MENTAL WELLNESS */}
          <p style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "clamp(16px, 1.9vw, 32px)",
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: "rgb(45, 74, 70)",
            textTransform: "uppercase",
            marginBottom: "36px",
          }}>
            ELEVATE YOUR MENTAL WELLNESS
          </p>

          {/* Large logo — 543px on 1710px screen = 31.7% of viewport */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt="Sama Wellness Therapy"
            style={{
              width: "clamp(280px, 31.7vw, 543px)",
              height: "clamp(280px, 31.7vw, 543px)",
              objectFit: "contain",
              display: "block",
              marginLeft: "63px",
            }}
          />

          {/* Professional Care tagline */}
          <p style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "clamp(22px, 2.6vw, 45px)",
            fontWeight: 300,
            color: "rgb(75, 99, 95)",
            marginTop: "40px",
            marginLeft: "7px",
            maxWidth: "684px",
          }}>
            Professional Care Tailored to Your Journey
          </p>
        </div>

        {/* Right column — room image fills full height, starts at top */}
        <div style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ROOM_URL}
            alt="Sama Wellness Therapy room"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </section>
  );
}
