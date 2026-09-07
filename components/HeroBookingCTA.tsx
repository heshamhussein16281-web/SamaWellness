"use client";
import { useState } from "react";
import BookingModal from "./BookingModal";

export default function HeroBookingCTA() {
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
          textTransform: "uppercase",
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
        Book Your Assessment
      </button>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
