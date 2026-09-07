"use client";
/* Final CTA Strip — closing conversion nudge before footer */
import { useState } from "react";
import BookingModal from "./BookingModal";

export default function FinalCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="final-cta" aria-label="Book Your Assessment">
        <div className="final-cta__inner">
          <h2 className="final-cta__heading">Ready to Take the First Step?</h2>
          <p className="final-cta__desc">
            Book a free 15-minute assessment and get matched with the right therapist.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="final-cta__button"
          >
            Book Your Assessment
          </button>
        </div>
      </section>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
