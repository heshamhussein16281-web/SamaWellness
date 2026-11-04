import Link from "next/link";
import Image from "next/image";

export type Teaser = {
  href: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  title: string;
  desc: string;
  cta: string;
};

export const teasers: Teaser[] = [
  {
    href: "/ar/services",
    image: "/individual-therapy-v3.webp",
    imageWidth: 678,
    imageHeight: 510,
    title: "خدماتنا",
    desc: "علاج فردي، زوجي، وجماعي — حضورياً أو أونلاين.",
    cta: "اكتشف خدماتنا",
  },
  {
    href: "/ar/team",
    image: "/team-photo-v3.webp",
    imageWidth: 993,
    imageHeight: 1240,
    title: "الفريق المهتم بصحتك",
    desc: "تعرف على المعالجين اللي هيرافقوك في رحلة التعافي.",
    cta: "تعرف على الفريق",
  },
  {
    href: "/ar/rooms",
    image: "/rooms-serenity1-v3.webp",
    imageWidth: 1240,
    imageHeight: 828,
    title: "مساحات العلاج",
    desc: "بيئات مصممة بعناية للشفاء.",
    cta: "شوف المساحات",
  },
  {
    href: "/ar/ask",
    image: "/sama2_nobg-v3.webp",
    imageWidth: 640,
    imageHeight: 523,
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
              <Image
                src={t.image}
                alt={t.title}
                width={t.imageWidth}
                height={t.imageHeight}
                sizes="(max-width: 560px) 100vw, (max-width: 980px) 50vw, 630px"
                className="teaser-card__image"
              />
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
