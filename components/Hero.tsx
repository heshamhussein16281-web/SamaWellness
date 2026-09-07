import Image from "next/image";
import HeroBookingCTA from "./HeroBookingCTA";

export default function Hero() {
  return (
    <section id="home" className="hero-section" style={{ backgroundColor: "#F5F2EE", minHeight: "770px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE — constrained to left column so it never overlaps the hero photo */}
      <p className="hero-text-elevate" style={{
        position: "absolute",
        top: "38px",
        left: "2%",
        width: "48%",
        fontFamily: "var(--font-ui)",
        fontSize: "clamp(18px, 1.875vw, 32px)",
        fontWeight: 300,
        letterSpacing: "4.81px",
        color: "rgb(45, 74, 70)",
        textTransform: "uppercase",
        margin: 0,
        textAlign: "center",
      }}>
        ELEVATE YOUR MENTAL WELLNESS
      </p>

      {/* Hero logo — centered in left space next to photo (0% to 52%) */}
      <Image
        src="/logo-hero.png"
        alt="Sama Wellness Therapy"
        width={543}
        height={543}
        priority
        className="hero-logo"
        style={{
          position: "absolute",
          top: "113px",
          left: "26%",
          transform: "translateX(-50%)",
          width: "clamp(380px, 31.7vw, 543px)",
          height: "clamp(380px, 31.7vw, 543px)",
          objectFit: "contain",
        }}
      />

      {/* Professional Care — constrained to left column (0 to 50%) */}
      <h1 className="hero-tagline" style={{
        position: "absolute",
        top: "540px",
        left: "2%",
        width: "48%",
        fontFamily: "var(--font-ui)",
        fontSize: "clamp(24px, 2.2vw, 38px)",
        zIndex: 2,
        fontWeight: 300,
        color: "rgb(75, 99, 95)",
        textAlign: "center",
        margin: 0,
        lineHeight: 1.3,
      }}>
        Professional Care Tailored to Your Journey
      </h1>

      {/* Hero CTA button + subtext — constrained to left column */}
      <div className="hero-cta-wrap" style={{
        position: "absolute",
        top: "640px",
        left: "2%",
        width: "48%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.625rem",
        zIndex: 2,
      }}>
        <HeroBookingCTA />
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(12px, 0.9vw, 15px)",
          color: "var(--color-tagline)",
          margin: 0,
          fontStyle: "italic",
          opacity: 0.85,
        }}>
          A free 15-minute call to match you with the right therapist
        </p>
      </div>

      {/* Room image — no rounding, no fade, exact match to original */}
      <div className="hero-room" style={{
        position: "absolute",
        top: "38px",
        left: "52%",
        width: "673px",
        height: "671px",
        borderRadius: "10.7px",
        overflow: "clip",
      }}>
        <Image
          src="/room.jpg"
          alt="Sama Wellness Therapy room"
          width={673}
          height={671}
          priority
          sizes="(max-width: 768px) 100vw, 673px"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "10.7px" }}
        />
      </div>

    </section>
  );
}
