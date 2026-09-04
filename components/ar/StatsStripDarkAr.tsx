const stats = [
  { number: "٨",      label: "معالجين متخصصين" },
  { number: "+٨٬٠٠٠", label: "ساعة علاج" },
  { number: "+١٥",    label: "سنة خبرة مجمعة" },
];

export default function StatsStripDarkAr() {
  return (
    <section className="stats-strip stats-strip--dark" aria-label="تأثيرنا">
      <div className="stats-strip__grid">
        {stats.map((s) => (
          <div className="stats-strip__item" key={s.label}>
            <span className="stats-strip__number">{s.number}</span>
            <span className="stats-strip__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
