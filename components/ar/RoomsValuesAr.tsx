export default function RoomsValuesAr() {
  const values = [
    {
      title: "إضاءة طبيعية",
      desc: "كل غرفة فيها إضاءة مدروسة — من توهج دافئ لضوء طبيعي — عشان نخلق جو بيحسسك بالانفتاح والهدوء.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      title: "خصوصية كاملة",
      desc: "جدران عازلة للصوت ومداخل خاصة بتضمن سرية تامة. اللي بيحصل في جلستك بيفضل في جلستك.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      title: "مصممة للراحة",
      desc: "أثاث ناعم، ألوان ترابية دافئة، لمسات نباتية، ولوحات فنية مدروسة — كل عنصر اتختار يساعدك تحس بالراحة.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2" />
          <path d="M19 10a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4z" />
          <path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="rooms-values" aria-label="إيه اللي بيميز مساحتنا">
      <div className="rooms-values__inner">
        <h2 className="rooms-values__heading">إيه اللي بيميز مساحتنا</h2>
        <div className="rooms-values__grid">
          {values.map((v) => (
            <article key={v.title} className="rooms-values__card">
              <div className="rooms-values__icon">{v.icon}</div>
              <h3 className="rooms-values__title">{v.title}</h3>
              <p className="rooms-values__desc">{v.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
