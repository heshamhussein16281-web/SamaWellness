import { therapists } from "@/lib/team-data";

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
  return (
    <section id="team" className="bg-linen py-24 border-t border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal text-center mb-16">
          The Team Dedicated to Your Wellness
        </h2>

        {/* First row — 4 therapists */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {therapists.slice(0, 4).map((t, i) => (
            <TherapistCard key={t.id} t={t} img={placeholderImages[i]} />
          ))}
        </div>

        {/* First row bios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {therapists.slice(0, 4).map((t) => (
            <Bio key={t.id} t={t} />
          ))}
        </div>

        {/* Second row — 4 therapists */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {therapists.slice(4, 8).map((t, i) => (
            <TherapistCard key={t.id} t={t} img={placeholderImages[i + 4]} />
          ))}
        </div>

        {/* Second row bios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {therapists.slice(4, 8).map((t) => (
            <Bio key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TherapistCard({ t, img }: { t: { name: string; title: string }; img: string }) {
  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden mb-3">
        <img src={img} alt={t.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>
      <p className="font-nav text-xs font-semibold tracking-[0.1em] uppercase text-charcoal">{t.name}</p>
      <p className="font-body text-xs text-charcoal/50 mt-0.5">{t.title}</p>
    </div>
  );
}

function Bio({ t }: { t: { specializations: string[]; bio: string } }) {
  return (
    <div>
      <p className="text-charcoal/65 text-xs leading-relaxed font-light mb-3">{t.bio}</p>
      <p className="font-nav text-xs tracking-[0.1em] uppercase text-charcoal/40 mb-2">Specialized in</p>
      <div className="flex flex-wrap gap-1">
        {t.specializations.map((s) => (
          <span key={s} className="text-xs text-burgundy-500 border border-burgundy-200 px-2 py-0.5">{s}</span>
        ))}
      </div>
    </div>
  );
}
