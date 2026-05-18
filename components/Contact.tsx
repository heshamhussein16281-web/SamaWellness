// Contact form + Footer + WhatsApp + marquee

const TOPICS = ["Individual Therapy", "Couple Therapy", "Group Therapy", "General Inquiry"];

function Contact() {
  const [form, setForm] = React.useState({ first_name: "", last_name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = React.useState("idle"); // idle | loading | success | error

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    // simulate network — in real app this hits Supabase
    await new Promise(r => setTimeout(r, 900));
    setStatus("success");
    setForm({ first_name: "", last_name: "", email: "", topic: "", message: "" });
  };

  return (
    <section id="contact" style={{ backgroundColor: "var(--linen)", padding: "96px 0", borderTop: "1px solid rgba(123,45,62,0.15)" }}>
      <div className="contact-grid" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 32px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "64px",
      }}>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 3.2vw, 48px)",
            fontWeight: 300,
            color: "var(--charcoal)",
            margin: "0 0 24px",
            lineHeight: 1.15,
          }}>Contact Us</h2>
          <p style={{
            color: "rgba(44,44,44,0.65)",
            fontWeight: 300,
            lineHeight: 1.7,
            margin: "0 0 40px",
            fontSize: "14px",
            fontFamily: "var(--font-body)",
          }}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div style={{ border: "1px solid rgba(123,45,62,0.25)", padding: "32px", marginBottom: "32px" }}>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 300,
              color: "var(--charcoal)",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}>Schedule Your Initial Assessment</h3>
            <p style={{
              color: "rgba(44,44,44,0.6)",
              fontSize: "14px",
              fontWeight: 300,
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "var(--font-body)",
            }}>
              The path to wellness begins with a meaningful connection. Reach out today to book your free 15-minute consultation with Dr. Sama and explore how our methodical screening process can guide you to the right support.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <a href="mailto:info@samawellnesstherapy.com" style={contactLinkStyle}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              info@samawellnesstherapy.com
            </a>
            <a href="tel:+201130946556" style={contactLinkStyle}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              (+2) 011 309 46556
            </a>
          </div>

          <a href="https://api.whatsapp.com/send?phone=201130946556" target="_blank" rel="noopener noreferrer"
            style={{
              marginTop: "32px",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              backgroundColor: "#25D366",
              color: "white",
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1ebe5d"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#25D366"}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <input className="form-input" name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
            <input className="form-input" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
          </div>
          <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email *" />
          <select className="form-input" name="topic" value={form.topic} onChange={handleChange} required>
            <option value="" disabled>How can we help you? *</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea className="form-input" name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Message *" />

          {status === "success" ? (
            <p style={{ color: "var(--olive)", fontSize: "14px", fontWeight: 300, margin: 0 }}>✓ Thank you! We'll be in touch soon.</p>
          ) : (
            <button type="submit" disabled={status === "loading"} className="btn-outline" style={{ alignSelf: "flex-start" }}>
              <span>{status === "loading" ? "Submitting…" : "Submit"}</span>
            </button>
          )}
          {status === "error" && <p style={{ color: "#c53030", fontSize: "12px", margin: 0 }}>Something went wrong. Please try again.</p>}
        </form>
      </div>
    </section>
  );
}

const contactLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "14px",
  color: "rgba(44,44,44,0.7)",
  textDecoration: "none",
  fontFamily: "var(--font-body)",
  fontWeight: 300,
  transition: "color 0.2s ease",
};

const MARQUEE_ITEMS = Array(8).fill("SAMA WELLNESS THERAPY — YOUR JOURNEY TO HEALING —");

const SOCIALS = [
  { label: "Facebook", href: "http://www.facebook.com", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: "http://www.instagram.com", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "YouTube", href: "http://www.youtube.com", d: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
  { label: "X", href: "http://www.x.com", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", href: "http://www.linkedin.com", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "TikTok", href: "http://www.tiktok.com", d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
];

function Footer() {
  return (
    <React.Fragment>
      <div style={{ overflow: "hidden", backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", borderBottom: "1px solid rgb(234,228,221)", padding: "16px 0", userSelect: "none" }}>
        <div className="marquee-track">
          {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((t, i) => (
            <span key={i} style={{ fontFamily: "var(--font-ui)", fontSize: "11px", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(45,74,70)", whiteSpace: "nowrap", margin: "0 32px" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <footer style={{ backgroundColor: "#F5F2EE", padding: "64px 0 40px", borderTop: "1px solid rgb(234,228,221)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" }}>
          <a href="#home">
            <img src="assets/logo.png" alt="Sama Wellness Therapy" style={{ width: "120px", height: "120px", objectFit: "contain", display: "block" }} />
          </a>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "12px", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(44,44,44,0.55)", lineHeight: 2, textAlign: "center", margin: 0 }}>
            New Giza — B1-C031 Meditown, Cairo, Egypt<br />
            info@samawellnesstherapy.com &nbsp;·&nbsp; (+2) 011 309 46556
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
              </a>
            ))}
          </div>
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(234,228,221)" }} />
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "10px", fontWeight: 300, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(44,44,44,0.35)", margin: 0 }}>
            © {new Date().getFullYear()} Sama Wellness Therapy. All rights reserved.
          </p>
        </div>
      </footer>
    </React.Fragment>
  );
}

function WhatsAppButton() {
  return (
    <a href="https://api.whatsapp.com/send?phone=201130946556" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="whatsapp-btn">
      <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

Object.assign(window, { Contact, Footer, WhatsAppButton });
