import Link from "next/link";

export type Teaser = {
  href: string;
  image: string;
  title: string;
  desc: string;
  cta: string;
};

export const teasers: Teaser[] = [
  {
    href: "/ar/services",
    image: "/individual-therapy.jpg",
    title: "خدماتنا",
    desc: "علاج فردي، زوجي، وجماعي في مساحة إكلينيكية آمنة.",
    cta: "اكتشف خدماتنا",
  },
  {
    href: "/ar/team",
    image: "/team%20photo.jpg",
    title: "الفريق المهتم بصحتك",
    desc: "تعرف على المعالجين اللي هيرافقوك في رحلة التعافي.",
    cta: "تعرف على الفريق",
  },
  {
    href: "/ar/rooms",
    image: "/rooms-serenity1.jpg",
    title: "مساحات العلاج",
    desc: "بيئات مصممة بعناية للشفاء.",
    cta: "شوف المساحات",
  },
  {
    href: "/ar/ask",
    image: "/sama2_nobg.png",
    title: "اسألي الكاونسلر سما",
    desc: "شاركنا سؤال عن الصحة النفسية واحصل على إرشاد حقيقي.",
    cta: "اسأل سؤال",
  },
];

export default function TeaserGridAr({ items = teasers }: { items?: Teaser[] }) {
  return (
    <section className="teaser-section" aria-label="اكتشف ساما ويلنس ثيرابي">
      <div className={`teaser-section__grid teaser-section__grid--cols-${items.length}`}>
        {items.map((t) => (
          <Link key={t.href} href={t.href} className="teaser-card">
            <div className="teaser-card__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image} alt={t.title} className="teaser-card__image" />
            </div>
            <div className="teaser-card__body">
              <h3 className="teaser-card__title">{t.title}</h3>
              <p className="teaser-card__desc">{t.desc}</p>
              <span className="teaser-card__link">{t.cta} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
