"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f4f7f4 0%, #faf8f3 40%, #faeadb 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-sage-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-clay-200/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-[0.2em] uppercase text-sage-600 bg-sage-100 rounded-full">
            Professional Care Tailored to Your Journey
          </span>
          <h1
            ref={headlineRef}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-charcoal text-balance"
          >
            Elevate Your{" "}
            <em className="text-sage-600 font-normal">Mental Wellness</em>
          </h1>
          <p className="mt-6 text-lg text-charcoal/60 font-body font-light leading-relaxed max-w-md">
            Healing support &amp; specialized care — matched to you through a
            methodical screening process.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#process"
              className="px-8 py-3.5 bg-sage-600 text-cream font-medium rounded-full hover:bg-sage-700 transition-colors text-sm tracking-wide"
            >
              Start Your Journey
            </a>
            <a
              href="#services"
              className="px-8 py-3.5 border border-charcoal/20 text-charcoal font-medium rounded-full hover:border-sage-600 hover:text-sage-600 transition-colors text-sm tracking-wide"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Visual card */}
        <div className="relative hidden md:block">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-sage-100 shadow-2xl">
            {/* Gradient placeholder — replace with <Image> when you have a real photo */}
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(160deg, #a3bfa3 0%, #547f54 60%, #354f35 100%)",
              }}
            />
            {/* Overlay text badge */}
            <div className="absolute bottom-8 left-8 right-8 bg-cream/90 backdrop-blur-sm rounded-2xl p-5">
              <p className="font-display text-2xl font-light text-charcoal">
                "A space where healing begins."
              </p>
              <p className="mt-1 text-xs text-charcoal/50 tracking-wide uppercase font-semibold">
                Sama Wellness Therapy · Cairo
              </p>
            </div>
          </div>
          {/* Floating stat */}
          <div className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clay-100 flex items-center justify-center text-clay-500">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-charcoal">8 Therapists</p>
              <p className="text-xs text-charcoal/50">Specialized team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs uppercase tracking-widest font-semibold text-charcoal">Scroll</span>
        <div className="w-px h-8 bg-charcoal animate-bounce" />
      </div>
    </section>
  );
}
