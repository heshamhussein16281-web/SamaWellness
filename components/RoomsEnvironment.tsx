export default function RoomsEnvironment() {
  const rooms = [
    {
      id: "serenity",
      name: "Serenity",
      description: "A warm, inviting space designed to calm the mind. Natural light, botanical artwork, and soft furnishings create an atmosphere of peace and reflection.",
      imagePath: "/rooms-serenity.jpg",
    },
    {
      id: "horizon",
      name: "Horizon",
      description: "A spacious, nurturing environment with warm earth tones and mindful decor. Carefully curated to support your journey of self-discovery and healing.",
      imagePath: "/rooms-horizon.jpg",
    },
  ];

  return (
    <section
      id="rooms"
      className="rooms-section"
      style={{
        backgroundColor: "var(--color-linen)",
        padding: "var(--space-md) var(--space-lg) var(--space-2xl) var(--space-lg)",
        position: "relative",
      }}
    >
      <div
        className="rooms-section__inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          className="rooms-section__heading"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400,
            color: "var(--color-nav-text)",
            textAlign: "center",
            marginBottom: "var(--space-sm)",
            margin: "0 0 var(--space-sm) 0",
          }}
        >
          Our Therapy Spaces
        </h2>

        <p
          className="rooms-section__subheading"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 1.5vw, 20px)",
            color: "var(--color-nav-text)",
            textAlign: "center",
            marginBottom: "var(--space-xl)",
            margin: "0 0 var(--space-xl) 0",
            fontWeight: 300,
          }}
        >
          Thoughtfully designed environments for healing
        </p>

        <div
          className="rooms-section__grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--space-lg)",
            maxWidth: "100%",
          }}
        >
          {rooms.map((room) => (
            <article key={room.id} className="rooms-card">
              <div className="rooms-card__photo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={room.imagePath} alt={room.name} />
              </div>
              <div className="rooms-card__body">
                <h3 className="rooms-card__name">{room.name}</h3>
                <p className="rooms-card__description">{room.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
