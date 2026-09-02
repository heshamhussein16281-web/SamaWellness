/* Rooms Values — 3 icon cards about what makes the space special */

export default function RoomsValues() {
  const values = [
    {
      title: "Natural Light",
      desc: "Every room features carefully considered lighting — from warm ambient glow to natural daylight — to create an atmosphere that feels open and calming.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      title: "Complete Privacy",
      desc: "Soundproofed walls and private entrances ensure total confidentiality. What happens in your session stays in your session.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      title: "Designed for Comfort",
      desc: "Soft furnishings, warm earth tones, botanical accents, and thoughtful artwork — every element was chosen to help you feel at ease.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2" />
          <path d="M19 10a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4z" />
          <path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="rooms-values" aria-label="What Makes Our Space Different">
      <div className="rooms-values__inner">
        <h2 className="rooms-values__heading">What Makes Our Space Different</h2>
        <div className="rooms-values__grid">
          {values.map((v) => (
            <article key={v.title} className="rooms-values__card">
              <div className="rooms-values__icon">{v.icon}</div>
              <h3 className="rooms-values__title">{v.title}</h3>
              <p className="rooms-values__desc">{v.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
