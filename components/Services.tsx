const services = [
  {
    title: "Individual Therapy",
    desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    title: "Couple Therapy",
    desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="16" cy="16" r="7" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <circle cx="32" cy="16" r="7" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M2 44c0-7.732 6.268-14 14-14" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M46 44c0-7.732-6.268-14-14-14" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M16 30c2.2-.6 4.6-.9 8-.9s5.8.3 8 .9" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    title: "Group Therapy",
    desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="10" r="6" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="22" r="6" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <circle cx="38" cy="22" r="6" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M14 40c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M2 44c0-4.418 3.582-8 8-8" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M46 44c0-4.418-3.582-8-8-8" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-linen py-24 border-t border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal text-center mb-16">
          Healing Support &amp; Specialized Care
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {services.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-5">{s.icon}</div>
              <h3 className="font-nav text-xs tracking-[0.15em] uppercase text-charcoal font-semibold mb-4">
                {s.title}
              </h3>
              <p className="text-charcoal/65 leading-relaxed text-sm font-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
