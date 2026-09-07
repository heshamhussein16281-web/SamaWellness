"use client";
import { useState } from "react";
import BookingModalAr from "./BookingModalAr";

export default function FinalCTAAr() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="final-cta" aria-label="احجز تقييمك">
        <div className="final-cta__inner">
          <h2 className="final-cta__heading">مستعد تاخد الخطوة الأولى؟</h2>
          <p className="final-cta__desc">
            احجز تقييم مجاني ١٥ دقيقة وهنختارلك المعالج المناسب.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="final-cta__button"
          >
            احجز تقييمك
          </button>
        </div>
      </section>
      <BookingModalAr isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
