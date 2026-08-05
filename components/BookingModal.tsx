"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Therapist } from "@/lib/team-data";

/**
 * BookingModal — Client booking request form
 *
 * Structure (BEM):
 *   .booking-modal-overlay
 *     └─ .booking-modal
 *        ├─ .booking-modal__header (therapist photo/name/title + close btn)
 *        └─ .booking-modal__body
 *           ├─ form fields (full name, mobile, optional email)
 *           └─ .booking-modal__success (shown after submit)
 */
export default function BookingModal({
  therapist,
  onClose,
}: {
  therapist: Therapist;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapist_id: therapist.id,
          therapist_name: therapist.name,
          full_name: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="booking-modal__success">
            <div className="booking-modal__success-icon">✓</div>
            <h3 className="booking-modal__success-title">Request Sent</h3>
            <p className="booking-modal__success-message">
              Thanks, {fullName.split(" ")[0]}! Our clinic will be in touch with
              you shortly to book your session with {therapist.name}.
            </p>
            <button className="booking-modal__cta" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="booking-modal__header">
              <button
                className="booking-modal__close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={therapist.image}
                alt={therapist.name}
                className="booking-modal__photo"
              />
              <h3 className="booking-modal__name">{therapist.name}</h3>
              <p className="booking-modal__title">{therapist.title}</p>
            </div>

            <div className="booking-modal__body">
              <p className="booking-modal__intro">
                Leave your details and our clinic will be in touch with you to
                book your session.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="booking-modal__field">
                  <label
                    className="booking-modal__label"
                    htmlFor="booking-full-name"
                  >
                    Full Name *
                  </label>
                  <input
                    id="booking-full-name"
                    className="booking-modal__input"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="booking-modal__field">
                  <label
                    className="booking-modal__label"
                    htmlFor="booking-mobile"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="booking-mobile"
                    className="booking-modal__input"
                    type="tel"
                    placeholder="+20 1XX XXX XXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="booking-modal__field">
                  <label
                    className="booking-modal__label"
                    htmlFor="booking-email"
                  >
                    Email <span className="booking-modal__optional">(optional)</span>
                  </label>
                  <input
                    id="booking-email"
                    className="booking-modal__input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && <p className="booking-modal__error">{error}</p>}

                <button
                  type="submit"
                  className="booking-modal__cta"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Request Booking"}
                </button>
                <p className="booking-modal__footnote">
                  We&apos;ll never share your details with anyone else.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
