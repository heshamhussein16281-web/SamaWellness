/* StatsStrip — Direction B: Boxed Cards */

const stats = [
  { number: "9",       label: "Licensed Therapists" },
  { number: "10,000+", label: "Combined Therapy Hours" },
  { number: "20+",    label: "Years Combined Experience" },
];

export default function StatsStripCards() {
  return (
    <section className="stats-strip stats-strip--cards" aria-label="Our Impact">
      <div className="stats-strip__grid">
        {stats.map((s) => (
          <div className="stats-strip__item" key={s.label}>
            <span className="stats-strip__accent" aria-hidden="true" />
            <span className="stats-strip__number">{s.number}</span>
            <span className="stats-strip__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
