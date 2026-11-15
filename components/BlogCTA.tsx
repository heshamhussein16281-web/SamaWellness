"use client";
import { useState } from "react";
import BookingModal from "./BookingModal";

export default function BlogCTA() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        marginTop: "48px",
        padding: "28px 24px",
        backgroundColor: "var(--color-linen)",
        borderRadius: "12px",
        borderLeft: "4px solid var(--color-burgundy)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          color: "var(--color-charcoal)",
          marginBottom: "8px",
          fontWeight: 400,
        }}
      >
        Ready to take the first step?
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "#666",
          marginBottom: "16px",
          lineHeight: 1.6,
        }}
      >
        Reach out to Sama Wellness Therapy for a free 15-minute assessment call.
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block",
          padding: "12px 28px",
          backgroundColor: "var(--color-burgundy)",
          color: "#fff",
          borderRadius: "8px",
          fontFamily: "var(--font-ui)",
          fontSize: "13px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          border: "none",
          cursor: "pointer",
        }}
      >
        Book Your Assessment
      </button>
      <BookingModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
