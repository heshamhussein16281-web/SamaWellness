/* How It Works — Option A: Numbered Circles with connecting line */

const steps = [
  { num: "1", title: "Book Your Assessment", desc: "A 15-minute assessment with Counselor Sama." },
  { num: "2", title: "Get Personally Matched", desc: "Counselor Sama selects the right therapist for you." },
  { num: "3", title: "Begin Your Journey", desc: "Start therapy with someone who truly understands you." },
];

export default function HowItWorksCircles() {
  return (
    <section className="how-it-works how-it-works--circles" aria-label="How It Works">
      <h2 className="how-it-works__heading">How It Works</h2>
      <div className="how-it-works__grid">
        {steps.map((s) => (
          <div className="how-it-works__step" key={s.num}>
            <span className="how-it-works__circle">{s.num}</span>
            <h3 className="how-it-works__title">{s.title}</h3>
            <p className="how-it-works__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
