const steps = [
  {
    num: "01",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="12" width="40" height="32" rx="2" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <line x1="8" y1="20" x2="48" y2="20" stroke="#7b2d3e" strokeWidth="1.5"/>
        <line x1="16" y1="28" x2="32" y2="28" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="34" x2="28" y2="34" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Initial Screening Form",
  },
  {
    num: "02",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="24" r="10" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M14 46c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M36 18 L40 14 M40 18 L36 14" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="40" cy="16" r="6" stroke="#4a6741" strokeWidth="1.5" fill="none"/>
        <line x1="40" y1="12" x2="40" y2="20" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="36" y1="16" x2="44" y2="16" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "15-Min Assessment with Counsellor Sama",
  },
  {
    num: "03",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="20" cy="22" r="8" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
        <path d="M6 44c0-7.732 6.268-14 14-14" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M32 44c0-7.732-6.268-14-12-14" stroke="#7b2d3e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M36 14 L50 28" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M44 14 L50 20 L38 20Z" fill="#4a6741"/>
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
