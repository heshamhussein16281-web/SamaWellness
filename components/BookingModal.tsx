"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

function getSamaLead(): { ts: number; src: string } | null {
  try {
    const raw = localStorage.getItem("sama_lead");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 3 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem("sama_lead");
      return null;
    }
    return data;
  } catch { return null; }
}

function setSamaLead(src: "form" | "wa") {
  try { localStorage.setItem("sama_lead", JSON.stringify({ ts: Date.now(), src })); } catch {}
}

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
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "duplicate">("idle");
  const [dupSrc, setDupSrc] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const lead = getSamaLead();
      if (lead) {
        setDupSrc(lead.src);
        setStatus("duplicate");
      } else {
        setTimeout(() => nameRef.current?.focus(), 350);
      }
      window.history.pushState({}, "", `${window.location.pathname}?book=open`);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const resetAndClose = useCallback(() => {
    setName("");
    setPhone("");
    setPreferredTime("");
    setNote("");
    setSessionFormat("either");
    setStatus("idle");
    setDupSrc(null);
    window.history.pushState({}, "", window.location.pathname);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") resetAndClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, resetAndClose]);

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
      setSamaLead("form");
      setStatus("success");
      window.history.pushState({}, "", `${window.location.pathname}?book=success`);
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="booking-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}>
      <div className="booking-modal">
        <button onClick={resetAndClose} className="booking-modal__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "duplicate" ? (
          <div className="booking-modal__success">
            <div className="booking-modal__success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="booking-modal__heading">You&apos;ve Already Reached Out</h2>
            <p className="booking-modal__desc">
              {dupSrc === "form"
                ? "We've received your request and will contact you on WhatsApp from 01130946556 shortly."
                : "You've already contacted us on WhatsApp — we'll reply to you there."}
            </p>
            {dupSrc === "wa" && (
              <a
                href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="booking-modal__btn"
                style={{ textAlign: "center", textDecoration: "none", display: "block" }}
              >
                Open WhatsApp
              </a>
            )}
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              Close
            </button>
          </div>
        ) : status === "success" ? (
          <div className="booking-modal__success">
            <div className="booking-modal__success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-olive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="booking-modal__heading">We&apos;ll Be in Touch</h2>
            <p className="booking-modal__desc">
              We&apos;ll contact you on WhatsApp from 01130946556 within a few hours to schedule your assessment — no need to message us.
            </p>
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="booking-modal__heading">Book Your Assessment</h2>
            <p className="booking-modal__desc">
              Schedule a 15-minute assessment with Counselor Sama to match you with the right therapist. The assessment is part of your first session.
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
                  {status === "sending" ? "Sending…" : "Book Assessment"}
                </button>
                <a
                  href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="booking-modal__btn booking-modal__btn--outline"
                  style={{ textAlign: "center", textDecoration: "none" }}
                  onClick={() => { setSamaLead("wa"); setTimeout(resetAndClose, 300); }}
                >
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
