import Image from "next/image";
import HeroBookingCTAAr from "./HeroBookingCTAAr";

export default function HeroAr() {
  return (
    <section id="home" className="hero-section" style={{ backgroundColor: "#F5F2EE", minHeight: "770px", position: "relative", overflow: "hidden" }}>

      {/* ELEVATE — constrained to right column for RTL */}
      <p className="hero-text-elevate" style={{
        position: "absolute",
        top: "38px",
        right: "2%",
        left: "auto",
        width: "48%",
        fontFamily: "var(--font-tajawal, var(--font-ui))",
        fontSize: "clamp(18px, 1.875vw, 32px)",
        fontWeight: 300,
        letterSpacing: "2px",
        color: "rgb(45, 74, 70)",
        margin: 0,
        textAlign: "center",
      }}>
        ارتقِ بصحتك النفسية
      </p>

      {/* Hero logo — centered in right space next to photo for RTL */}
      <Image
        src="/logo-hero.png"
        alt="ساما ويلنس ثيرابي"
        width={543}
        height={543}
        priority
        className="hero-logo"
        style={{
          position: "absolute",
          top: "113px",
          right: "26%",
          left: "auto",
          transform: "translateX(50%)",
          width: "clamp(380px, 31.7vw, 543px)",
          height: "clamp(380px, 31.7vw, 543px)",
          objectFit: "contain",
        }}
      />

      {/* Professional Care — constrained to right column for RTL */}
      <h1 className="hero-tagline" style={{
        position: "absolute",
        top: "540px",
        right: "2%",
        left: "auto",
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
        رعاية متخصصة مصممة لرحلتك
      </h1>

      {/* Hero CTA button + subtext — constrained to right column for RTL */}
      <div className="hero-cta-wrap" style={{
        position: "absolute",
        top: "640px",
        right: "2%",
        left: "auto",
        width: "48%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.625rem",
        zIndex: 2,
      }}>
        <HeroBookingCTAAr />
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(12px, 0.9vw, 15px)",
          color: "var(--color-tagline)",
          margin: 0,
          fontStyle: "italic",
          opacity: 0.85,
        }}>
          مكالمة مجانية ١٥ دقيقة لاختيار المعالج المناسب ليك
        </p>
      </div>

      {/* Room image — mirrored to left side for RTL */}
      <div className="hero-room" style={{
        position: "absolute",
        top: "38px",
        right: "52%",
        left: "auto",
        width: "673px",
        height: "671px",
        borderRadius: "10.7px",
        overflow: "clip",
      }}>
        <Image
          src="/room.jpg"
          alt="غرفة ساما ويلنس ثيرابي"
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
