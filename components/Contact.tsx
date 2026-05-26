"use client";
import { useState } from "react";

const topics = ["Individual Therapy", "Couple Therapy", "Group Therapy", "General Inquiry"];

export default function Contact() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setStatus("success");
        setForm({ first_name: "", last_name: "", email: "", topic: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-grid">

        {/* Left — Form */}
        <div className="contact-form-col">
          <h2 className="contact-heading">Contact Us</h2>
          <p className="contact-subtext">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-name-row">
              <div className="contact-field">
                <label className="contact-label">First name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="contact-field">
                <label className="contact-label">Last name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="contact-field">
              <label className="contact-label">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="contact-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="contact-field">
              <label className="contact-label">How can we help you? *</label>
              <div className="contact-select-wrap">
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  className="contact-select"
                >
                  <option value="" disabled>Select a topic</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="contact-field">
              <label className="contact-label">Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="contact-textarea"
                placeholder="Tell us how we can help you"
              />
            </div>

            {status === "success" ? (
              <p className="contact-success">✓ Thank you! We&apos;ll be in touch soon.</p>
            ) : (
              <button type="submit" disabled={status === "loading"} className="contact-submit">
                {status === "loading" ? "Submitting…" : "Submit"}
              </button>
            )}
            {status === "error" && (
              <p className="contact-error">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>

        {/* Right — Info */}
        <div className="contact-info-col">
          <h3 className="contact-info-heading">Schedule Your Initial Assessment</h3>
          <p className="contact-info-body">
            The path to wellness begins with a meaningful connection. Reach out today to book your free
            15-minute consultation with Dr. Sama and explore how our methodical screening process can
            guide you to the right support.
          </p>
          <a href="mailto:info@samawellnesstherapy.com" className="contact-info-link">
            info@samawellnesstherapy.com
          </a>
          <a href="tel:+201130946556" className="contact-info-link">
            (+2)01130946556
          </a>
        </div>

      </div>
    </section>
  );
}
