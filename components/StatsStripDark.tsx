/* StatsStrip — Direction A: Dark Band */

const stats = [
  { number: "8",      label: "Licensed Therapists" },
  { number: "8,000+", label: "Combined Therapy Hours" },
  { number: "15+",    label: "Years Combined Experience" },
];

export default function StatsStripDark() {
  return (
    <section className="stats-strip stats-strip--dark" aria-label="Our Impact">
      <div className="stats-strip__grid">
        {stats.map((s) => (
          <div className="stats-strip__item" key={s.label}>
            <span className="stats-strip__number">{s.number}</span>
            <span className="stats-strip__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
