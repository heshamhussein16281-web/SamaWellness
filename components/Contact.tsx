"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const topics = ["Individual Therapy", "Couple Therapy", "Group Therapy", "General Inquiry"];

export default function Contact() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("contact_submissions").insert([form]);
    setStatus(error ? "error" : "success");
    if (!error) setForm({ first_name: "", last_name: "", email: "", topic: "", message: "" });
  };

  return (
    <section id="contact" className="bg-linen py-24 border-t border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16">
        {/* Left */}
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal mb-6">Contact Us</h2>
          <p className="text-charcoal/65 font-light leading-relaxed mb-10 text-sm">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div className="border border-burgundy-200 p-8 mb-8">
            <h3 className="font-display text-2xl font-light text-charcoal mb-3">
              Schedule Your Initial Assessment
            </h3>
            <p className="text-charcoal/60 text-sm font-light leading-relaxed">
              The path to wellness begins with a meaningful connection. Reach out today to book your free 15-minute consultation with Dr. Sama and explore how our methodical screening process can guide you to the right support.
            </p>
          </div>

          <div className="space-y-4">
            <a href="mailto:info@samawellnesstherapy.com" className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-burgundy-500 transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              info@samawellnesstherapy.com
            </a>
            <a href="tel:+201130946556" className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-burgundy-500 transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              (+2) 011 309 46556
            </a>
          </div>

          <a href="https://api.whatsapp.com/send?phone=201130946556" target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white text-xs font-nav tracking-[0.15em] uppercase hover:bg-[#1ebe5d] transition-colors">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>

        {/* Form — minimal placeholder style */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <input name="first_name" value={form.first_name} onChange={handleChange}
              className="w-full border-b border-charcoal/20 bg-transparent py-2 text-sm text-charcoal focus:outline-none focus:border-burgundy-500 transition-colors placeholder:text-charcoal/40"
              placeholder="First name" />
            <input name="last_name" value={form.last_name} onChange={handleChange}
              className="w-full border-b border-charcoal/20 bg-transparent py-2 text-sm text-charcoal focus:outline-none focus:border-burgundy-500 transition-colors placeholder:text-charcoal/40"
              placeholder="Last name" />
          </div>

          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className="w-full border-b border-charcoal/20 bg-transparent py-2 text-sm text-charcoal focus:outline-none focus:border-burgundy-500 transition-colors placeholder:text-charcoal/40"
            placeholder="Email *" />

          <select name="topic" value={form.topic} onChange={handleChange} required
            className="w-full border-b border-charcoal/20 bg-transparent py-2 text-sm text-charcoal focus:outline-none focus:border-burgundy-500 transition-colors">
            <option value="" disabled>How can we help you? *</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
            className="w-full border-b border-charcoal/20 bg-transparent py-2 text-sm text-charcoal focus:outline-none focus:border-burgundy-500 transition-colors resize-none placeholder:text-charcoal/40"
            placeholder="Message *" />

          {status === "success" ? (
            <p className="text-olive-500 text-sm font-light">✓ Thank you! We'll be in touch soon.</p>
          ) : (
            <button type="submit" disabled={status === "loading"}
              className="px-10 py-3 border border-burgundy-500 text-burgundy-500 font-nav text-xs tracking-[0.2em] uppercase hover:bg-burgundy-500 hover:text-linen transition-all duration-200 disabled:opacity-50">
              {status === "loading" ? "Submitting…" : "Submit"}
            </button>
          )}
          {status === "error" && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}
        </form>
      </div>
    </section>
  );
}
