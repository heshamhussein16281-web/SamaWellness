/* StatsStrip — Direction C: Icon Accent */

import { Users, Clock, Award } from "lucide-react";

const stats = [
  { icon: Users, number: "9",       label: "Licensed Therapists" },
  { icon: Clock, number: "10,000+", label: "Combined Therapy Hours" },
  { icon: Award, number: "20+",    label: "Years Combined Experience" },
];

export default function StatsStripIcon() {
  return (
    <section className="stats-strip stats-strip--icon" aria-label="Our Impact">
      <div className="stats-strip__grid">
        {stats.map((s) => (
          <div className="stats-strip__item" key={s.label}>
            <s.icon className="stats-strip__icon" size={24} strokeWidth={1.5} />
            <span className="stats-strip__number">{s.number}</span>
            <span className="stats-strip__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
