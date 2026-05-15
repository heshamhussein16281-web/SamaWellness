"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const topics = [
  "Individual Therapy",
  "Couple Therapy",
  "Group Therapy",
  "General Inquiry",
];

export default function Contact() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.topic || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.from("contact_submissions").insert([form]);
    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or email us directly.");
    } else {
      setStatus("success");
      setForm({ first_name: "", last_name: "", email: "", topic: "", message: "" });
    }
  };

  return (
    <section id="contact" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* Left */}
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600">
            Get in Touch
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-light text-charcoal leading-tight">
            Contact <em className="text-sage-600">Us</em>
          </h2>
          <p className="mt-4 text-charcoal/60 font-light leading-relaxed max-w-md">
            We&apos;d love to hear from you. Send us a message and we&apos;ll
            respond as soon as possible.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <a href="mailto:info@samawellnesstherapy.com" className="text-charcoal/70 hover:text-sage-600 transition-colors">
                info@samawellnesstherapy.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <a href="tel:+201130946556" className="text-charcoal/70 hover:text-sage-600 transition-colors">
                (+2) 011 309 46556
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="text-charcoal/70">New Giza — B1-C031 Meditown</span>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://api.whatsapp.com/send?phone=201130946556"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-full font-medium text-sm hover:bg-[#1ebe5d] transition-colors"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-sage-100 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide mb-1.5">First Name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50 text-charcoal text-sm focus:outline-none focus:border-sage-400 transition-colors"
                placeholder="Nour"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide mb-1.5">Last Name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50 text-charcoal text-sm focus:outline-none focus:border-sage-400 transition-colors"
                placeholder="Ahmed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide mb-1.5">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50 text-charcoal text-sm focus:outline-none focus:border-sage-400 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide mb-1.5">How Can We Help? *</label>
            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50 text-charcoal text-sm focus:outline-none focus:border-sage-400 transition-colors"
            >
              <option value="">Select a topic</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal/50 uppercase tracking-wide mb-1.5">Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-sage-50 text-charcoal text-sm focus:outline-none focus:border-sage-400 transition-colors resize-none"
              placeholder="Tell us a bit about what you're looking for…"
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          {status === "success" ? (
            <div className="rounded-xl bg-sage-100 text-sage-700 px-5 py-4 text-sm font-medium">
              ✓ Thank you! We'll be in touch soon.
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 bg-sage-600 text-cream font-medium rounded-full hover:bg-sage-700 disabled:opacity-50 transition-colors text-sm tracking-wide"
            >
              {status === "loading" ? "Sending…" : "Send Message"}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
