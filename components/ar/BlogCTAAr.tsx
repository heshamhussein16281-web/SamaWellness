"use client";
import { useState } from "react";
import BookingModalAr from "./BookingModalAr";

export default function BlogCTAAr() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        marginTop: "48px",
        padding: "28px 24px",
        backgroundColor: "var(--color-linen)",
        borderRadius: "12px",
        borderRight: "4px solid var(--color-burgundy)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-tajawal)",
          fontSize: "1.15rem",
          color: "var(--color-charcoal)",
          marginBottom: "8px",
          fontWeight: 400,
        }}
      >
        جاهز تاخد أول خطوة؟
      </p>
      <p
        style={{
          fontFamily: "var(--font-tajawal)",
          fontSize: "14px",
          color: "#666",
          marginBottom: "16px",
          lineHeight: 1.8,
        }}
      >
        تواصل مع سما ويلنس ثيرابي لحجز مكالمة تقييم مجانية مدتها ١٥ دقيقة.
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block",
          padding: "12px 28px",
          backgroundColor: "var(--color-burgundy)",
          color: "#fff",
          borderRadius: "8px",
          fontFamily: "var(--font-tajawal)",
          fontSize: "13px",
          border: "none",
          cursor: "pointer",
        }}
      >
        احجز تقييمك
      </button>
      <BookingModalAr isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
