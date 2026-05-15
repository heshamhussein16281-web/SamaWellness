"use client";
import { useState } from "react";
import { therapists } from "@/lib/team-data";
import Image from "next/image";

export default function Team() {
  const [active, setActive] = useState<number | null>(null);
  const selected = therapists.find((t) => t.id === active);

  return (
    <section id="team" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-600">
            Our Therapists
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-light text-charcoal leading-tight">
            The Team Dedicated to{" "}
            <em className="text-sage-600">Your Wellness</em>
          </h2>
          <p className="mt-4 text-charcoal/60 font-light leading-relaxed">
            Click on any therapist to learn more about their background and specializations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {therapists.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(active === t.id ? null : t.id)}
              className={`text-left rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                active === t.id
                  ? "border-sage-400 shadow-lg shadow-sage-100"
                  : "border-sage-100 hover:border-sage-300"
              }`}
            >
              {/* Avatar placeholder */}
              <div className="aspect-[3/4] bg-gradient-to-br from-sage-200 to-sage-400 relative flex items-end p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="relative z-10">
                  <p className="font-display text-lg font-semibold text-cream leading-tight">
                    {t.name}
                  </p>
                  <p className="text-cream/70 text-xs mt-0.5">{t.title}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded card */}
        {selected && (
          <div className="mt-10 rounded-3xl border border-sage-200 bg-sage-50 p-8 md:p-10 grid md:grid-cols-3 gap-8">
            <div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-sage-200 to-sage-500" />
            </div>
            <div className="md:col-span-2">
              <h3 className="font-display text-3xl font-semibold text-charcoal">
                {selected.name}
              </h3>
              <p className="text-sage-600 font-medium mt-1 mb-4">
                {selected.title}
              </p>
              <p className="text-charcoal/70 leading-relaxed font-light text-sm">
                {selected.bio}
              </p>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/40 mb-3">
                  Specialized in
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.specializations.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
