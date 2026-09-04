import { PhoneCall, UserCheck, HeartHandshake } from "lucide-react";

const steps = [
  { icon: PhoneCall, title: "احجز تقييمك", desc: "مكالمة مجانية ١٥ دقيقة مع الكاونسلر سما." },
  { icon: UserCheck, title: "معالج مُختار خصيصاً ليك", desc: "الكاونسلر سما بتختار المعالج المناسب ليك." },
  { icon: HeartHandshake, title: "ابدأ رحلتك", desc: "ابدأ العلاج مع حد فعلاً بيفهمك." },
];

export default function HowItWorksIconsAr() {
  return (
    <section className="how-it-works how-it-works--icons" aria-label="إزاي بنشتغل">
      <h2 className="how-it-works__heading">إزاي بنشتغل</h2>
      <div className="how-it-works__grid">
        {steps.map((s) => (
          <div className="how-it-works__step" key={s.title}>
            <span className="how-it-works__icon">
              <s.icon size={36} strokeWidth={1.5} />
            </span>
            <h3 className="how-it-works__title">{s.title}</h3>
            <p className="how-it-works__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
