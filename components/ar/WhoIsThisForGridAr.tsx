import { Brain, Heart, Users, Sunrise, ShieldAlert, Sparkles } from "lucide-react";

const conditions = [
  { icon: Brain, label: "القلق والتوتر" },
  { icon: Heart, label: "مشاكل العلاقات" },
  { icon: ShieldAlert, label: "الصدمات واضطراب ما بعد الصدمة" },
  { icon: Sunrise, label: "التحولات الحياتية" },
  { icon: Users, label: "الخلافات الأسرية" },
  { icon: Sparkles, label: "النمو الشخصي" },
];

export default function WhoIsThisForGridAr() {
  return (
    <section className="who-for-grid" aria-label="المجالات اللي بنساعد فيها">
      <div className="who-for-grid__inner">
        <h2 className="who-for-grid__heading">المجالات اللي بنساعد فيها</h2>
        <p className="who-for-grid__subtext">
          مهما كان اللي بتواجهه، معالجينا متدربين يساعدوك.
        </p>
        <div className="who-for-grid__grid">
          {conditions.map((c) => (
            <div className="who-for-grid__card" key={c.label}>
              <c.icon className="who-for-grid__icon" size={32} strokeWidth={1.5} />
              <span className="who-for-grid__label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
