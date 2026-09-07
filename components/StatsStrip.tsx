/* ========================================
   STATS STRIP COMPONENT (preview — for review)

   Purpose: Trust-building numbers bar between Hero and ValuesStrip.
   3 stats displayed in a clean horizontal row with vertical dividers.

   Structure (BEM):
   .stats-strip
     └─ .stats-strip__grid
          └─ .stats-strip__item (x3)
               ├─ .stats-strip__number
               └─ .stats-strip__label
   ======================================== */

const stats = [
  { number: "9",       label: "Licensed Therapists" },
  { number: "10,000+", label: "Combined Therapy Hours" },
  { number: "20+",    label: "Years Combined Experience" },
];

export default function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Our Impact">
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
