/* Mid-page CTA (Arabic) — lightweight booking nudge at ~50% scroll depth.
   Opens the standard booking modal (form + WhatsApp option), same as
   every other assessment CTA on the site — see Action 26. */
"use client";
import { useState } from "react";
import BookingModalAr from "./BookingModalAr";

export default function MidCTAAr() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mid-cta" aria-label="احجز تقييم مجاني">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          مش متأكد تبدأ منين؟&ensp;
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mid-cta__link"
          >
            احجز تقييم مجاني ١٥ دقيقة&nbsp;&larr;
          </button>
        </p>
      </div>
      <BookingModalAr isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
