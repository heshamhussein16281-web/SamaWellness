"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => nameRef.current?.focus(), 350);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferred_time: preferredTime || null,
          note: note || null,
          source: "booking_modal",
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const resetAndClose = () => {
    setName("");
    setPhone("");
    setPreferredTime("");
    setNote("");
    setStatus("idle");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="booking-modal-overlay" onClick={resetAndClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={resetAndClose} className="booking-modal__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="booking-modal__success">
            <div className="booking-modal__success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="booking-modal__heading">We&apos;ll Be in Touch</h2>
            <p className="booking-modal__desc">
              Our team will reach out within a few hours to schedule your free 15-minute assessment with Counselor Sama.
            </p>
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="booking-modal__heading">Book Your Free Assessment</h2>
            <p className="booking-modal__desc">
              Leave your details and we&apos;ll call you to schedule a free 15-minute assessment with Counselor Sama.
            </p>

            <form onSubmit={handleSubmit} className="booking-modal__form">
              <div className="booking-modal__field">
                <label htmlFor="booking-name" className="booking-modal__label">Name</label>
                <input
                  ref={nameRef}
                  id="booking-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="booking-modal__input"
                />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-phone" className="booking-modal__label">Phone / WhatsApp</label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01130946556"
                  className="booking-modal__input"
                />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-time" className="booking-modal__label">Preferred Time</label>
                <select
                  id="booking-time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="booking-modal__select"
                >
                  <option value="">No preference</option>
                  <option value="morning">Morning (9 AM – 12 PM)</option>
                  <option value="afternoon">Afternoon (12 – 5 PM)</option>
                  <option value="evening">Evening (5 – 9 PM)</option>
                </select>
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-note" className="booking-modal__label">
                  Anything you&apos;d like us to know? <span className="booking-modal__optional">(optional)</span>
                </label>
                <textarea
                  id="booking-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Brief concern, preferred therapist gender, etc."
                  rows={2}
                  className="booking-modal__textarea"
                />
              </div>

              {status === "error" && (
                <p className="booking-modal__error">
                  Something went wrong. Please try again or message us on{" "}
                  <a href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="booking-modal__btn"
              >
                {status === "sending" ? "Sending…" : "Request Callback"}
              </button>

              <p className="booking-modal__footer">
                Prefer to message directly?{" "}
                <a
                  href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp →
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
