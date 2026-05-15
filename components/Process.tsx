const steps = [
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="14" width="44" height="36" rx="2" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <line x1="10" y1="24" x2="54" y2="24" stroke="#7b2d3e" strokeWidth="1.5"/>
        <line x1="18" y1="34" x2="36" y2="34" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="18" y1="40" x2="30" y2="40" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Initial Screening Form",
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="28" cy="24" r="10" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M12 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="46" cy="18" r="8" stroke="#4a6741" strokeWidth="1.5" fill="none"/>
        <line x1="46" y1="14" x2="46" y2="22" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="42" y1="18" x2="50" y2="18" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "15-Min Assessment with Counsellor Sama",
  },
  {
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="22" cy="24" r="10" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M6 52c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M38 30 L54 30 M48 24 L54 30 L48 36" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Matched Therapist",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-linen py-24 border-t border-burgundy-100">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal text-center mb-16">
          The Matching Process Simplified
        </h2>
        <div className="grid md:grid-cols-3 gap-12 mb-14">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-5">{s.icon}</div>
              <h3 className="font-nav text-xs tracking-[0.15em] uppercase text-charcoal font-semibold leading-relaxed">
                {s.title}
              </h3>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a
            href="https://ec1484c2-75c5-4118-9703-33fa4f397289.filesusr.com/ugd/c9c2af_54b7a2ba71d746f6bc234d84627a18a0.pages?dn=SWT%20Screening%20WD.pages"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-3 border border-burgundy-500 text-burgundy-500 font-nav text-xs tracking-[0.2em] uppercase hover:bg-burgundy-500 hover:text-linen transition-all duration-200"
          >
            OPEN INITIAL SCREENING FORM
          </a>
        </div>
      </div>
    </section>
  );
}
