const steps = [
  {
    number: "01",
    title: "Initial Screening Form",
    desc: "Complete our intake form so we can understand your needs, background, and what you're seeking from therapy.",
  },
  {
    number: "02",
    title: "15-Min Assessment",
    desc: "A free 15-minute consultation with counsellor Sama to discuss your goals and answer any questions you have.",
  },
  {
    number: "03",
    title: "Matched Therapist",
    desc: "Based on your profile, you're matched with the therapist whose specialization and approach best fits your journey.",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-clay-500">
            How It Works
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-light text-charcoal leading-tight">
            The Matching Process{" "}
            <em className="text-clay-500">Simplified</em>
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.66%-1rem)] right-[calc(16.66%-1rem)] h-px bg-sage-200" />

          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="relative z-10 w-12 h-12 rounded-full bg-sage-600 text-cream flex items-center justify-center font-display font-semibold text-lg mb-6">
                {i + 1}
              </div>
              <span className="block font-display text-6xl font-light text-sage-100 -mt-2 mb-2 leading-none select-none">
                {s.number}
              </span>
              <h3 className="font-display text-2xl font-semibold text-charcoal mb-3 -mt-8">
                {s.title}
              </h3>
              <p className="text-charcoal/60 leading-relaxed font-light">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <a
            href="https://ec1484c2-75c5-4118-9703-33fa4f397289.filesusr.com/ugd/c9c2af_54b7a2ba71d746f6bc234d84627a18a0.pages?dn=SWT%20Screening%20WD.pages"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 bg-sage-600 text-cream font-medium rounded-full hover:bg-sage-700 transition-colors text-sm tracking-wide uppercase"
          >
            Open Initial Screening Form
          </a>
        </div>
      </div>
    </section>
  );
}
