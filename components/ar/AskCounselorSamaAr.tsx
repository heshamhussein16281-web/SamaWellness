"use client";
import { useState } from "react";

const topics = ["القلق والتوتر", "العلاقات", "العناية بالنفس", "التأمل والوعي", "النمو الشخصي", "أخرى"];

export default function AskCounselorSamaAr() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", question: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/counselor-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setStatus("success");
        setForm({ name: "", email: "", topic: "", question: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  };

  return (
    <section id="ask-sama" className="ask-sama-section">
      <div className="ask-sama-grid">

        {/* Right in RTL — Form */}
        <div className="ask-sama-form-col">
          <h2 className="ask-sama-heading">اسألي الكاونسلر سما</h2>
          <p className="ask-sama-subtext">
            شاركنا سؤال عن الصحة النفسية وممكن أعرضه في ريلز الانستجرام بتاعتي. احصل على إرشاد حقيقي وساعد غيرك يكتشفوا طريقهم لصحة نفسية أحسن.
          </p>

          <form onSubmit={handleSubmit} className="ask-sama-form">
            <div className="ask-sama-field">
              <label className="ask-sama-label">اسمك (اختياري)</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="ask-sama-input"
                placeholder="إزاي أخاطبك؟"
              />
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">البريد الإلكتروني *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="ask-sama-input"
                placeholder="هنبلغك لما الريل ينزل"
              />
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">الموضوع *</label>
              <div className="ask-sama-select-wrap">
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  className="ask-sama-select"
                >
                  <option value="" disabled>اختار موضوع</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">سؤالك *</label>
              <textarea
                name="question"
                value={form.question}
                onChange={handleChange}
                required
                rows={4}
                className="ask-sama-textarea"
                placeholder="إيه اللي في بالك؟"
              />
            </div>

            {status === "success" ? (
              <div className="ask-sama-success">
                <p className="ask-sama-success-text">&#10003; شكراً! سؤالك اتسجل. هنعرضه في الريلز قريب.</p>
                <a href="https://www.instagram.com/sama.wellness.therapy/" target="_blank" rel="noopener noreferrer" className="ask-sama-instagram-link">
                  تابعنا على انستجرام →
                </a>
              </div>
            ) : (
              <button type="submit" disabled={status === "loading"} className="ask-sama-submit">
                {status === "loading" ? "جاري الإرسال..." : "إرسال"}
              </button>
            )}
            {status === "error" && (
              <p className="ask-sama-error">حصل مشكلة. حاول تاني.</p>
            )}
          </form>
        </div>

        {/* Left in RTL — Sama Photo */}
        <div className="ask-sama-photo-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sama2_nobg.png"
            alt="سما عيسى — المؤسسة والكاونسلر"
            className="ask-sama-photo"
          />
        </div>

      </div>
    </section>
  );
}
