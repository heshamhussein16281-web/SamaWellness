"use client";

const services = [
  {
    title: "العلاج الفردي",
    desc: "جلسات فردية مركزة بتساعدك تستكشف التحديات الشخصية، تدير الضغط، وتطور استراتيجيات تأقلم صحية في مساحة إكلينيكية آمنة.",
    image: "/individual-therapy.jpg",
  },
  {
    title: "العلاج الزوجي",
    desc: "إرشاد متخصص للأزواج اللي عايزين يحسنوا التواصل، يحلوا الخلافات المتكررة، ويبنوا أساس أقوى لعلاقتهم.",
    image: "/couple-therapy.jpg",
  },
  {
    title: "العلاج الجماعي",
    desc: "تعافي في مجتمع بإشراف إكلينيكي. التجارب المشتركة بتوفر دعم متبادل ووجهات نظر متنوعة في رحلتك للصحة النفسية.",
    image: "/group-therapy.jpg",
  },
];

export default function ServicesAr() {
  return (
    <section
      id="services"
      className="services-section"
      aria-label="خدماتنا"
    >
      <div className="services-section__inner">
      <h2 className="services-section__heading">
        دعم نفسي ورعاية متخصصة
      </h2>

      <div className="services-section__grid">
        {services.map((s, i) => (
          <article key={i} className="service-card">
            <div className="service-card__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                className="service-card__image"
              />
            </div>
            <div className="service-card__body">
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
