/* Mid-page CTA — lightweight booking nudge placed at ~50% scroll depth
   so visitors who don't scroll to FinalCTA still see a conversion prompt.
   Opens the standard booking modal (form + WhatsApp option), same as
   every other assessment CTA on the site — see Action 26. */
"use client";
import { useState } from "react";
import BookingModal from "./BookingModal";

export default function MidCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mid-cta" aria-label="Book a free assessment">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          Not sure where to start?&ensp;
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mid-cta__link"
          >
            Book a free 15-min assessment&nbsp;&rarr;
          </button>
        </p>
      </div>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
