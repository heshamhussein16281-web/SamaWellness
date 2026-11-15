/* How It Works — Option C: Icon-led */
"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneCall, UserCheck, HeartHandshake } from "lucide-react";
import BookingModal from "./BookingModal";

const steps = [
  { icon: PhoneCall, title: "Book Your Assessment", desc: "A free 15-minute call with Counselor Sama." },
  { icon: UserCheck, title: "Get Personally Matched", desc: "Counselor Sama selects the right therapist for you." },
  { icon: HeartHandshake, title: "Begin Your Journey", desc: "Start therapy with someone who truly understands you." },
];

export default function HowItWorksIcons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="how-it-works how-it-works--icons" aria-label="How It Works">
      <h2 className="how-it-works__heading">How It Works</h2>
      <div className="how-it-works__grid">
        {steps.map((s, i) => {
          const icon = (
            <span className="how-it-works__icon">
              <s.icon size={36} strokeWidth={1.5} />
            </span>
          );
          const title = <h3 className="how-it-works__title">{s.title}</h3>;
          const desc = <p className="how-it-works__desc">{s.desc}</p>;

          if (i === 1) {
            return (
              <Link
                key={s.title}
                href="/team"
                className="how-it-works__step how-it-works__step--clickable how-it-works__step--team"
                aria-label="Meet the team — go to the Team page"
              >
                {icon}
                {title}
                {desc}
                <span className="how-it-works__link">Meet the team →</span>
              </Link>
            );
          }

          return (
            <button
              key={s.title}
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="how-it-works__step how-it-works__step--clickable how-it-works__step--book"
              aria-label="Book your free assessment"
            >
              {icon}
              {title}
              {desc}
              <span className="how-it-works__link">Book now →</span>
            </button>
          );
        })}
      </div>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
