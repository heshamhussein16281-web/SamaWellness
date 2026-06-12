"use client";
import { useState } from "react";

const topics = ["Anxiety & Stress", "Relationships", "Self-Care", "Mindfulness", "Personal Growth", "Other"];

export default function AskCounselorSama() {
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
        setForm({ name: "", email: "", topic: "", question: "", consent: false });
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

        {/* Left — Form */}
        <div className="ask-sama-form-col">
          <h2 className="ask-sama-heading">Ask Counselor Sama</h2>
          <p className="ask-sama-subtext">
            Share a wellness question and I might feature it in my Instagram reels. Get authentic guidance while helping others discover their path to better mental health.
          </p>

          <form onSubmit={handleSubmit} className="ask-sama-form">
            <div className="ask-sama-field">
              <label className="ask-sama-label">Your name (optional)</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="ask-sama-input"
                placeholder="How should I address you?"
              />
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="ask-sama-input"
                placeholder="I'll notify you when your reel goes live"
              />
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">Topic *</label>
              <div className="ask-sama-select-wrap">
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  className="ask-sama-select"
                >
                  <option value="" disabled>Select a topic</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="ask-sama-field">
              <label className="ask-sama-label">Your question *</label>
              <textarea
                name="question"
                value={form.question}
                onChange={handleChange}
                required
                rows={4}
                className="ask-sama-textarea"
                placeholder="What's on your mind?"
              />
            </div>

            {status === "success" ? (
              <div className="ask-sama-success">
                <p className="ask-sama-success-text">✓ Thank you! Your question has been submitted. I'll feature it in my reels soon.</p>
                <a href="https://www.instagram.com/sama.wellness.therapy/" target="_blank" rel="noopener noreferrer" className="ask-sama-instagram-link">
                  Follow on Instagram →
                </a>
              </div>
            ) : (
              <button type="submit" disabled={status === "loading"} className="ask-sama-submit">
                {status === "loading" ? "Submitting…" : "Submit"}
              </button>
            )}
            {status === "error" && (
              <p className="ask-sama-error">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>

        {/* Right — Info */}
        <div className="ask-sama-info-col">
          <h3 className="ask-sama-info-heading">Featured in my reels</h3>
          <p className="ask-sama-info-body">
            Every question submitted helps create meaningful content for our wellness community. Your authentic question could resonate with thousands, spark important conversations, and help others navigate their own wellness journey.
          </p>

          <div className="ask-sama-info-highlight">
            <p className="ask-sama-info-highlight-text">
              <strong>Why share your question?</strong><br/>
              Your voice matters. The more specific your question, the better the guidance I can offer—and the more valuable it becomes for others watching.
            </p>
          </div>

          <a href="https://www.instagram.com/sama.wellness.therapy/" target="_blank" rel="noopener noreferrer" className="ask-sama-info-link">
            @sama.wellness.therapy on Instagram
          </a>
        </div>

      </div>
    </section>
  );
}
