"use client";

const services = [
  {
    title: "Individual Therapy",
    desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
    image: "/individual-therapy.jpg",
  },
  {
    title: "Couple Therapy",
    desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
    image: "/couple-therapy.jpg",
  },
  {
    title: "Group Therapy",
    desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
    image: "/group-therapy.jpg",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="services-section"
      style={{ backgroundColor: "rgb(234, 228, 221)" }}
    >
      <h2 className="services-section__heading">
        Healing Support &amp; Specialized Care
      </h2>

      <div className="services-section__grid services-grid">
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
    </section>
  );
}
