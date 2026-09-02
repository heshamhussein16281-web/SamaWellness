/* How It Works — Option C: Icon-led */

import { PhoneCall, UserCheck, HeartHandshake } from "lucide-react";

const steps = [
  { icon: PhoneCall, title: "Book Your Assessment", desc: "A free 15-minute call with Counselor Sama." },
  { icon: UserCheck, title: "Get Personally Matched", desc: "Counselor Sama selects the right therapist for you." },
  { icon: HeartHandshake, title: "Begin Your Journey", desc: "Start therapy with someone who truly understands you." },
];

export default function HowItWorksIcons() {
  return (
    <section className="how-it-works how-it-works--icons" aria-label="How It Works">
      <h2 className="how-it-works__heading">How It Works</h2>
      <div className="how-it-works__grid">
        {steps.map((s) => (
          <div className="how-it-works__step" key={s.title}>
            <span className="how-it-works__icon">
              <s.icon size={36} strokeWidth={1.5} />
            </span>
            <h3 className="how-it-works__title">{s.title}</h3>
            <p className="how-it-works__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
