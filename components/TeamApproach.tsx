/* Team Approach — Our values/approach cards */

import { Fingerprint, HeartHandshake, Brain } from "lucide-react";

const values = [
  {
    icon: Fingerprint,
    title: "No One-Size-Fits-All",
    desc: "Every client is unique. Our therapists tailor their approach to fit your personality, not a textbook.",
  },
  {
    icon: HeartHandshake,
    title: "Built on Trust",
    desc: "Confidential, non-judgmental, and deeply respectful of your pace and boundaries.",
  },
  {
    icon: Brain,
    title: "Evidence-Based Methods",
    desc: "CBT, Gestalt, EMDR, systemic therapy — our team is trained in proven, modern approaches.",
  },
];

export default function TeamApproach() {
  return (
    <section className="team-approach" aria-label="Our Approach">
      <div className="team-approach__inner">
        <h2 className="team-approach__heading">How We Work</h2>
        <div className="team-approach__grid">
          {values.map((v) => (
            <div className="team-approach__card" key={v.title}>
              <v.icon className="team-approach__icon" size={36} strokeWidth={1.5} />
              <h3 className="team-approach__title">{v.title}</h3>
              <p className="team-approach__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
