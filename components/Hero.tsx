const LOGO_URL = "https://static.wixstatic.com/media/c9c2af_737fbe5934df446dbf671e28c6103fd6~mv2.png";

export default function Hero() {
  return (
    <section id="home" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative" }}>

      {/* ELEVATE text — top:38px from header bottom, left:131px */}
      <p style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(14px, 1.9vw, 32px)",
        fontWeight: 300,
        letterSpacing: "0.15em",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Big logo — top:288px(113px below ELEVATE), left:194px, 543px wide */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt="Sama Wellness Therapy"
        style={{
          position: "absolute",
          top: "113px",
          left: "194px",
          width: "clamp(240px, 31.7vw, 543px)",
          height: "clamp(240px, 31.7vw, 543px)",
          objectFit: "contain",
        }}
      />

      {/* Professional Care — top:781px from header bottom = 606px below logo top */}
      <p style={{
        position: "absolute",
        top: "606px",
        left: "138px",
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: "clamp(20px, 2.6vw, 45px)",
        fontWeight: 300,
        color: "rgb(75, 99, 95)",
        maxWidth: "684px",
        margin: 0,
      }}>
        Professional Care Tailored to Your Journey
      </p>

      {/* Room image — top:38px (same as ELEVATE), left:55%, width:39%, height:671px */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/room.jpg"
        alt="Sama Wellness Therapy room"
        style={{
          position: "absolute",
          top: "38px",
          left: "54.6%",
          width: "39.4%",
          height: "671px",
          objectFit: "cover",
        }}
      />

    </section>
  );
}
