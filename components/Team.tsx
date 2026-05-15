"use client";
import { useState } from "react";
import { therapists } from "@/lib/team-data";

// Unsplash placeholder portraits (professional headshots)
const placeholderImages = [
  "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108755-2616b612b5be?w=400&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&q=80",
  "https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=400&q=80",
];

export default function Team() {
  const [active, setActive] = useState<number | null>(null);
  const selected = therapists.find((t) => t.id === active);

  return (
    <section id="team" className="bg-linen py-24 border-t border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal text-center mb-16">
          The Team Dedicated to Your Wellness
        </h2>

        {/* First row — 4 therapists */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {therapists.slice(0, 4).map((t, i) => (
            <TherapistCard
              key={t.id}
              t={t}
              img={placeholderImages[i]}
              active={active === t.id}
              onClick={() => setActive(active === t.id ? null : t.id)}
            />
          ))}
        </div>

        {/* Second row — 4 therapists */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {therapists.slice(4, 8).map((t, i) => (
            <TherapistCard
              key={t.id}
              t={t}
              img={placeholderImages[i + 4]}
              active={active === t.id}
              onClick={() => setActive(active === t.id ? null : t.id)}
            />
          ))}
        </div>

        {/* Expanded bio */}
        {selected && (
          <div className="mt-10 border border-burgundy-100 bg-white/50 p-8 md:p-10 grid md:grid-cols-3 gap-8">
            <div>
              <img
                src={placeholderImages[selected.id - 1]}
                alt={selected.name}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="font-display text-3xl font-semibold text-charcoal">{selected.name}</h3>
              <p className="font-nav text-xs tracking-[0.15em] uppercase text-burgundy-500 mt-1 mb-5">{selected.title}</p>
              <p className="text-charcoal/70 leading-relaxed text-sm font-light">{selected.bio}</p>
              <div className="mt-6">
                <p className="font-nav text-xs tracking-[0.15em] uppercase text-charcoal/40 mb-3">Specialized in</p>
                <div className="flex flex-wrap gap-2">
                  {selected.specializations.map((s) => (
                    <span key={s} className="px-3 py-1 border border-burgundy-200 text-burgundy-500 text-xs font-nav tracking-wide">
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

function TherapistCard({ t, img, active, onClick }: {
  t: { id: number; name: string; title: string };
  img: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left group transition-all duration-200 ${active ? "ring-2 ring-burgundy-400" : ""}`}
    >
      <div className="aspect-[3/4] overflow-hidden mb-3">
        <img
          src={img}
          alt={t.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <p className="font-nav text-xs font-semibold tracking-[0.1em] uppercase text-charcoal">{t.name}</p>
      <p className="font-body text-xs text-charcoal/50 mt-0.5">{t.title}</p>
    </button>
  );
}
