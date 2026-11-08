"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { appendSourceSuffix, getLeadSource } from "@/lib/sourceTag";

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

interface BookingModalArProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModalAr({ isOpen, onClose }: BookingModalArProps) {
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
          source: "booking_modal_ar",
          lead_source: getLeadSource(),
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
      <div className="booking-modal booking-modal--rtl">
        <button onClick={resetAndClose} className="booking-modal__close" aria-label="إغلاق">
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
            <h2 className="booking-modal__heading">إنت تواصلت معانا بالفعل</h2>
            <p className="booking-modal__desc">
              {dupSrc === "form"
                ? "استلمنا طلبك وهنتواصل معاك على واتساب من رقم 01130946556 قريب."
                : "إنت تواصلت معانا على واتساب بالفعل، هنرد عليك هناك."}
            </p>
            {dupSrc === "wa" && (
              <a
                href={`https://api.whatsapp.com/send?phone=201130946556&text=${appendSourceSuffix("%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="booking-modal__btn"
                style={{ textAlign: "center", textDecoration: "none", display: "block" }}
              >
                افتح واتساب
              </a>
            )}
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              إغلاق
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
            <h2 className="booking-modal__heading">هنتواصل معاك قريب</h2>
            <p className="booking-modal__desc">
              هنتواصل معاك على واتساب من رقم 01130946556 خلال ساعات قليلة عشان نحدد معاد التقييم، مش محتاج تبعتلنا رسالة.
            </p>
            <button onClick={resetAndClose} className="booking-modal__btn booking-modal__btn--outline">
              إغلاق
            </button>
          </div>
        ) : (
          <>
            <h2 className="booking-modal__heading">احجز تقييمك</h2>
            <p className="booking-modal__desc">
              احجز تقييم 15 دقيقة مع الأخصائية سما عشان نختارلك المعالج المناسب. التقييم جزء من جلستك الأولى.
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
                <label className="booking-modal__label">صيغة الجلسة</label>
                <div className="booking-modal__format-group">
                  {(["in-person", "online", "either"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`booking-modal__format-btn${sessionFormat === fmt ? " booking-modal__format-btn--active" : ""}`}
                      onClick={() => setSessionFormat(fmt)}
                    >
                      {fmt === "in-person" ? "حضوري" : fmt === "online" ? "أونلاين" : "أي منهما"}
                    </button>
                  ))}
                </div>
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
                  <a href={`https://api.whatsapp.com/send?phone=201130946556&text=${appendSourceSuffix("%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85")}`} target="_blank" rel="noopener noreferrer">
                    واتساب
                  </a>.
                </p>
              )}

              <div className="booking-modal__btn-group">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="booking-modal__btn"
                >
                  {status === "sending" ? "جاري الإرسال…" : "احجز التقييم"}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?phone=201130946556&text=${appendSourceSuffix("%D8%A3%D9%86%D8%A7%20%D8%B9%D8%A7%D9%8A%D8%B2%2F%D8%A9%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="booking-modal__btn booking-modal__btn--outline"
                  style={{ textAlign: "center", textDecoration: "none" }}
                  onClick={() => { setSamaLead("wa"); setTimeout(resetAndClose, 300); }}
                >
                  تواصل على واتساب
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
