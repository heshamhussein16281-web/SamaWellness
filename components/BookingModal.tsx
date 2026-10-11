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
  const [sessionFormat, setSessionFormat] = useState<"in-person" | "online" | "either">("either");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => nameRef.current?.focus(), 350);
      window.history.pushState({}, "", `${window.location.pathname}?book=open`);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const resetAndClose = () => {
    setName("");
    setPhone("");
    setPreferredTime("");
    setNote("");
    setSessionFormat("either");
    setStatus("idle");
    window.history.pushState({}, "", window.location.pathname);
    onClose();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") resetAndClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          session_format: sessionFormat,
          note: note || null,
          source: "booking_modal",
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      window.history.pushState({}, "", `${window.location.pathname}?book=success`);
    } catch {
      setStatus("error");
    }
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
                <label className="booking-modal__label">Session Format</label>
                <div className="booking-modal__format-group">
                  {(["in-person", "online", "either"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`booking-modal__format-btn${sessionFormat === fmt ? " booking-modal__format-btn--active" : ""}`}
                      onClick={() => setSessionFormat(fmt)}
                    >
                      {fmt === "in-person" ? "In-Person" : fmt === "online" ? "Online" : "Either"}
                    </button>
                  ))}
                </div>
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

              <div className="booking-modal__btn-group">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="booking-modal__btn"
                >
                  {status === "sending" ? "Sending…" : "Request Callback"}
                </button>

                <a
                  href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="booking-modal__btn booking-modal__btn--outline booking-modal__btn--whatsapp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.746-.873-2.888-1.56-4.035-3.537-.305-.526.305-.489.873-1.629.099-.198.05-.371-.05-.52-.098-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.197 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.042 3.112 4.945 4.238 2.904 1.126 2.904.751 3.424.703.52-.05 1.69-.692 1.927-1.361.238-.67.238-1.24.173-1.362-.064-.123-.242-.198-.519-.347zM12.004 2C6.486 2 2 6.486 2 12.004c0 2.098.638 4.053 1.733 5.68L2.5 22l4.436-1.213A9.956 9.956 0 0 0 12.004 22c5.518 0 10.004-4.486 10.004-10.004C22.008 6.486 17.522 2 12.004 2zm0 18.26a8.23 8.23 0 0 1-4.43-1.294l-.317-.2-3.21.878.85-3.13-.208-.321a8.233 8.233 0 0 1-1.287-4.425c0-4.556 3.707-8.262 8.262-8.262 4.555 0 8.262 3.706 8.262 8.262 0 4.555-3.707 8.262-8.262 8.262z" />
                  </svg>
                  Message on WhatsApp
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
