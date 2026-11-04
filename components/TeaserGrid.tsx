/* ========================================
   TEASER GRID COMPONENT (draft — for review)

   Purpose: Home-page preview cards linking out to the
   Services / Team / Rooms / Ask Sama pages. Copy is quoted
   directly from the existing section headings/subtext —
   nothing new was written.

   Structure (BEM):
   .teaser-grid
     └─ .teaser-card (article, x4)
        ├─ .teaser-card__image-wrap
        ├─ .teaser-card__title
        ├─ .teaser-card__desc
        └─ .teaser-card__link
   ======================================== */

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
    href: "/services",
    image: "/individual-therapy.webp",
    imageWidth: 678,
    imageHeight: 510,
    title: "Our Services",
    desc: "Individual, couple, and group therapy — in-person or online.",
    cta: "Explore our services",
  },
  {
    href: "/team",
    image: "/team-photo.webp",
    imageWidth: 993,
    imageHeight: 1240,
    title: "The Team Dedicated to Your Wellness",
    desc: "Meet the therapists guiding your journey to healing.",
    cta: "Meet the team",
  },
  {
    href: "/rooms",
    image: "/rooms-serenity1.webp",
    imageWidth: 1240,
    imageHeight: 828,
    title: "Our Therapy Spaces",
    desc: "Thoughtfully designed environments for healing.",
    cta: "See our spaces",
  },
  {
    href: "/ask",
    image: "/sama2_nobg.webp",
    imageWidth: 640,
    imageHeight: 523,
    title: "Ask Counselor Sama",
    desc: "Share a wellness question and get authentic guidance.",
    cta: "Ask a question",
  },
];

export default function TeaserGrid({ items = teasers }: { items?: Teaser[] }) {
  return (
    <section className="teaser-section" aria-label="Explore Sama Wellness Therapy">
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
