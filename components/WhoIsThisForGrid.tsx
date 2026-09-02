/* Who Is This For — Option B: Icon grid of conditions */

import { Brain, Heart, Users, Sunrise, ShieldAlert, Sparkles } from "lucide-react";

const conditions = [
  { icon: Brain, label: "Anxiety & Stress" },
  { icon: Heart, label: "Relationship Issues" },
  { icon: ShieldAlert, label: "Trauma & PTSD" },
  { icon: Sunrise, label: "Life Transitions" },
  { icon: Users, label: "Family Conflicts" },
  { icon: Sparkles, label: "Personal Growth" },
];

export default function WhoIsThisForGrid() {
  return (
    <section className="who-for-grid" aria-label="Areas We Support">
      <div className="who-for-grid__inner">
        <h2 className="who-for-grid__heading">Areas We Support</h2>
        <p className="who-for-grid__subtext">
          Whatever you are facing, our therapists are trained to help.
        </p>
        <div className="who-for-grid__grid">
          {conditions.map((c) => (
            <div className="who-for-grid__card" key={c.label}>
              <c.icon className="who-for-grid__icon" size={32} strokeWidth={1.5} />
              <span className="who-for-grid__label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
