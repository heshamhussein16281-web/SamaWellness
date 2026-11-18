"use client";

import { useState } from "react";
import Link from "next/link";
import { PhoneCall, UserCheck, HeartHandshake } from "lucide-react";
import BookingModalAr from "./BookingModalAr";

const steps = [
  { icon: PhoneCall, title: "احجز تقييمك", desc: "مكالمة مجانية ١٥ دقيقة مع الكاونسلر سما." },
  { icon: UserCheck, title: "معالج مُختار خصيصاً ليك", desc: "الكاونسلر سما بتختار المعالج المناسب ليك." },
  { icon: HeartHandshake, title: "ابدأ رحلتك", desc: "ابدأ العلاج مع حد فعلاً بيفهمك." },
];

export default function HowItWorksIconsAr() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="how-it-works how-it-works--icons" aria-label="إزاي بنشتغل">
      <h2 className="how-it-works__heading">إزاي بنشتغل</h2>
      <p
        className="how-it-works__desc"
        style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto var(--space-xl)" }}
      >
        عيادتنا في نيو جيزة، قريبة من الشيخ زايد و٦ أكتوبر، والجلسات متاحة أونلاين لخارج الجيزة.
      </p>
      <div className="how-it-works__grid">
        {steps.map((s, i) => {
          const icon = (
            <span className="how-it-works__icon">
              <s.icon size={36} strokeWidth={1.5} />
            </span>
          );
          const title = <h3 className="how-it-works__title">{s.title}</h3>;
          const desc = <p className="how-it-works__desc">{s.desc}</p>;

          if (i === 1) {
            return (
              <Link
                key={s.title}
                href="/ar/team"
                className="how-it-works__step how-it-works__step--clickable how-it-works__step--team"
                aria-label="تعرف على الفريق — روح لصفحة الفريق"
              >
                {icon}
                {title}
                {desc}
                <span className="how-it-works__link">تعرف على الفريق ←</span>
              </Link>
            );
          }

          return (
            <button
              key={s.title}
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="how-it-works__step how-it-works__step--clickable how-it-works__step--book"
              aria-label="احجز تقييمك المجاني"
            >
              {icon}
              {title}
              {desc}
              <span className="how-it-works__link">احجز دلوقتي ←</span>
            </button>
          );
        })}
      </div>
      <BookingModalAr isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
