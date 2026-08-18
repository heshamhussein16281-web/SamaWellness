/* ========================================
   VALUES STRIP COMPONENT (draft — for review)

   Purpose: 3 core values displayed between Hero and TeaserGrid
   on the homepage to build trust before visitors explore services.

   Structure (BEM):
   .values-strip
     └─ .values-strip__grid
          └─ .values-strip__card (x3)
               ├─ .values-strip__icon
               ├─ .values-strip__title
               └─ .values-strip__desc
   ======================================== */

import { UserCheck, ShieldCheck, Leaf } from "lucide-react";

const values = [
  {
    icon: UserCheck,
    title: "Personally Matched",
    desc: "Counselor Sama personally selects your therapist based on a 15-minute assessment — no random assignments.",
  },
  {
    icon: ShieldCheck,
    title: "Complete Confidentiality",
    desc: "Everything shared stays protected. Licensed, ethical, and fully confidential care.",
  },
  {
    icon: Leaf,
    title: "A Space That Heals",
    desc: "Our New Giza clinic is designed to feel calm and welcoming from the moment you walk in.",
  },
];

export default function ValuesStrip() {
  return (
    <section className="values-strip" aria-label="Our Values">
      <div className="values-strip__grid">
        {values.map((v) => (
          <div className="values-strip__card" key={v.title}>
            <span className="values-strip__icon">
              <v.icon size={32} strokeWidth={1.5} />
            </span>
            <h3 className="values-strip__title">{v.title}</h3>
            <p className="values-strip__desc">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
