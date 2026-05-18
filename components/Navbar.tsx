// Navbar, Hero, ScrollReveal
const { useState, useEffect, useRef } = React;

const NAV_LINKS = [
  { label: "HOME", href: "home" },
  { label: "OUR SERVICES", href: "services" },
  { label: "THE PROCESS", href: "process" },
  { label: "THE TEAM", href: "team" },
  { label: "CONTACT US", href: "contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const lockRef = useRef(false);

  useEffect(() => {
    let scrollTimer = null;
    const handleScroll = () => {
      if (lockRef.current) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollY = window.scrollY + 200;
        for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
          const el = document.getElementById(NAV_LINKS[i].href);
          if (el && el.offsetTop <= scrollY) {
            setActive(NAV_LINKS[i].href);
            break;
          }
        }
      }, 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) {
      const headerH = 175;
      const top = el.offsetTop - headerH + 1;
      lockRef.current = true;
      setActive(href);
      window.scrollTo({ top, behavior: "smooth" });
      setTimeout(() => { lockRef.current = false; }, 900);
    }
    setOpen(false);
  };

  return (
    <header style={{
      height: "175px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "#F5F2EE",
      borderBottom: "1px solid rgb(234, 228, 221)",
      width: "100%",
      overflow: "visible",
    }}>
      <a href="#home" onClick={e => handleClick(e, "home")}
        style={{ position: "absolute", top: "-7px", left: "-3px", display: "block", width: "182px", height: "182px", zIndex: 10 }}
        className="logo-link">
        <img src="assets/logo.png" alt="Sama Wellness Therapy"
          style={{ width: "182px", height: "182px", objectFit: "contain", display: "block" }} />
      </a>

      <nav className="desktop-nav" style={{
        position: "absolute",
        left: "265px",
        top: "42px",
        right: "40px",
        height: "84px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",
        columnGap: "44px",
      }}>
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={`#${l.href}`}
            onClick={e => handleClick(e, l.href)}
            className={"nav-link" + (active === l.href ? " active" : "")}
            style={{
              fontSize: "clamp(15px, 1.4vw, 22.7px)",
              lineHeight: "29.52px",
            }}>
            {l.label}
          </a>
        ))}
      </nav>

      <button
        className="mobile-toggle"
        aria-label="Toggle menu"
        style={{
          position: "absolute",
          right: "24px",
          top: "50%",
          transform: "translateY(-50%)",
          padding: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => setOpen(v => !v)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(45deg) translateY(5px)" : "none" }} />
          <span style={{ display: "block", width: "16px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", opacity: open ? 0 : 1 }} />
          <span style={{ display: "block", width: "24px", height: "1px", background: "rgb(45,74,70)", transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translateY(-5px)" : "none" }} />
        </div>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#F5F2EE", borderBottom: "1px solid rgb(234,228,221)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", zIndex: 50 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={e => handleClick(e, l.href)}
              className={"nav-link" + (active === l.href ? " active" : "")}
              style={{ fontSize: "18px", padding: "0" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-section" style={{ backgroundColor: "#F5F2EE", minHeight: "987px", position: "relative", overflow: "hidden" }}>
      <p className="hero-text-elevate" style={{
        position: "absolute",
        top: "38px",
        left: "131px",
        fontFamily: "var(--font-ui)",
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

      <img
        className="hero-logo"
        src="assets/logo-hero.png"
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

      <p className="hero-tagline" style={{
        position: "absolute",
        top: "606px",
        left: "138px",
        width: "clamp(400px, 40vw, 684px)",
        fontFamily: "var(--font-ui)",
        fontSize: "clamp(28px, 2.65vw, 45px)",
        fontWeight: 300,
        color: "rgb(75, 99, 95)",
        textAlign: "center",
        margin: 0,
        lineHeight: 1.3,
      }}>
        Professional Care Tailored to Your Journey
      </p>

      <div className="hero-room" style={{
        position: "absolute",
        top: "38px",
        left: "54.6%",
        width: "min(673px, 42vw)",
        height: "min(671px, 41.9vw)",
        borderRadius: "10.7px",
        overflow: "hidden",
      }}>
        <img
          src="assets/room.jpg"
          alt="Sama Wellness Therapy room"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "10.7px" }}
        />
      </div>
    </section>
  );
}

function ScrollReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const els = ref.current?.querySelectorAll(".reveal") || [];
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{children}</div>;
}

Object.assign(window, { Navbar, Hero, ScrollReveal });
