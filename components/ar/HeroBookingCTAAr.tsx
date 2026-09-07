"use client";
import { useState } from "react";
import BookingModalAr from "./BookingModalAr";

export default function HeroBookingCTAAr() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="hero-cta"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-ui)",
          fontSize: "clamp(14px, 1.1vw, 18px)",
          fontWeight: 400,
          letterSpacing: "1.5px",
          color: "var(--color-linen)",
          backgroundColor: "var(--color-burgundy)",
          padding: "16px 40px",
          borderRadius: "var(--radius-sm)",
          border: "none",
          cursor: "pointer",
          transition: "var(--transition-base)",
          whiteSpace: "nowrap",
        } as React.CSSProperties}
      >
        احجز تقييمك
      </button>
      <BookingModalAr isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
