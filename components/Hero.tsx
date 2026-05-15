const LOGO_URL = "https://static.wixstatic.com/media/c9c2af_737fbe5934df446dbf671e28c6103fd6~mv2.png";

export default function Hero() {
  return (
    <section id="home" className="bg-linen" style={{ backgroundColor: "#F5F2EE" }}>
      <div className="grid md:grid-cols-2" style={{ minHeight: "calc(100vh - 175px)" }}>

        {/* Left: ELEVATE text + large logo + Professional Care tagline */}
        <div className="flex flex-col justify-center items-center px-12 py-16">

          {/* ELEVATE YOUR MENTAL WELLNESS */}
          <p style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "32px",
            fontWeight: 300,
            letterSpacing: "4.8px",
            color: "rgb(45, 74, 70)",
            textTransform: "uppercase",
            alignSelf: "flex-start",
            marginBottom: "40px",
          }}>
            ELEVATE YOUR MENTAL WELLNESS
          </p>

          {/* Large logo — 543x543 in original, scale down proportionally */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_URL}
            alt="Sama Wellness Therapy"
            style={{ width: "380px", height: "380px", objectFit: "contain", objectPosition: "center" }}
          />

          {/* Professional Care tagline */}
          <p style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "32px",
            fontWeight: 300,
            letterSpacing: "normal",
            color: "rgb(75, 99, 95)",
            textAlign: "center",
            marginTop: "32px",
          }}>
            Professional Care Tailored to Your Journey
          </p>
        </div>

        {/* Right: therapy room image */}
        <div className="hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/room.jpg"
            alt="Sama Wellness Therapy room"
            style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "600px" }}
          />
        </div>
      </div>
    </section>
  );
}
