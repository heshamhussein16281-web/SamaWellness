"use client";
import { useState, useEffect, useRef } from "react";

interface BookingModalArProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModalAr({ isOpen, onClose }: BookingModalArProps) {
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
          source: "booking_modal_ar",
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

  return (
    <div className="booking-modal-overlay" onClick={resetAndClose}>
      <div className="booking-modal booking-modal--rtl" onClick={(e) => e.stopPropagation()}>
        <button onClick={resetAndClose} className="booking-modal__close" aria-label="إغلاق">
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
            <h2 className="booking-modal__heading">هنتواصل معاك قريب</h2>
            <p className="booking-modal__desc">
              فريقنا هيتواصل معاك في خلال ساعات قليلة لحجز تقييمك المجاني مع الكاونسلر سما.
            </p>
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              إغلاق
            </button>
          </div>
        ) : (
          <>
            <h2 className="booking-modal__heading">احجز تقييمك المجاني</h2>
            <p className="booking-modal__desc">
              سيب بياناتك وهنتصل بيك لحجز تقييم مجاني ١٥ دقيقة مع الكاونسلر سما.
            </p>

            <form onSubmit={handleSubmit} className="booking-modal__form">
              <div className="booking-modal__field">
                <label htmlFor="booking-name-ar" className="booking-modal__label">الاسم</label>
                <input
                  ref={nameRef}
                  id="booking-name-ar"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك بالكامل"
                  className="booking-modal__input"
                />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-phone-ar" className="booking-modal__label">رقم الموبايل / واتساب</label>
                <input
                  id="booking-phone-ar"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: ٠١١٣٠٩٤٦٥٥٦"
                  className="booking-modal__input"
                  dir="ltr"
                />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-time-ar" className="booking-modal__label">الوقت المفضل</label>
                <select
                  id="booking-time-ar"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="booking-modal__select"
                >
                  <option value="">مفيش تفضيل</option>
                  <option value="morning">الصبح (٩ ص – ١٢ م)</option>
                  <option value="afternoon">بعد الظهر (١٢ – ٥ م)</option>
                  <option value="evening">بالليل (٥ – ٩ م)</option>
                </select>
              </div>

              <div className="booking-modal__field">
                <label htmlFor="booking-note-ar" className="booking-modal__label">
                  حابب/ة تقولنا حاجة؟ <span className="booking-modal__optional">(اختياري)</span>
                </label>
                <textarea
                  id="booking-note-ar"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="موضوع مختصر، تفضيل معالج/ة، إلخ."
                  rows={2}
                  className="booking-modal__textarea"
                />
              </div>

              {status === "error" && (
                <p className="booking-modal__error">
                  حصل مشكلة. حاول/ي تاني أو كلمنا على{" "}
                  <a href="https://api.whatsapp.com/send?phone=201130946556&text=%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85" target="_blank" rel="noopener noreferrer">
                    واتساب
                  </a>.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="booking-modal__btn"
              >
                {status === "sending" ? "جاري الإرسال…" : "اطلب مكالمة"}
              </button>

              <p className="booking-modal__footer">
                تفضل/ي تراسلنا مباشرة؟{" "}
                <a
                  href="https://api.whatsapp.com/send?phone=201130946556&text=%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ← كلمنا على واتساب
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
