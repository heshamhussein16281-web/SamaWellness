import { Fingerprint, HeartHandshake, Brain } from "lucide-react";

const values = [
  {
    icon: Fingerprint,
    title: "مفيش حل واحد للكل",
    desc: "كل عميل فريد. معالجينا بيصمموا منهجهم يناسب شخصيتك.",
  },
  {
    icon: HeartHandshake,
    title: "مبني على الثقة",
    desc: "سري، بدون أحكام، وباحترام عميق لإيقاعك وحدودك.",
  },
  {
    icon: Brain,
    title: "مناهج مبنية على أدلة",
    desc: "CBT (العلاج المعرفي السلوكي)، الجشتالت (Gestalt)، EMDR (إزالة التحسس بحركة العين)، العلاج النظامي — فريقنا متدرب على مناهج حديثة ومثبتة.",
  },
];

export default function TeamApproachAr() {
  return (
    <section className="team-approach" aria-label="منهجنا">
      <div className="team-approach__inner">
        <h2 className="team-approach__heading">إزاي بنشتغل</h2>
        <div className="team-approach__grid">
          {values.map((v) => (
            <div className="team-approach__card" key={v.title}>
              <v.icon className="team-approach__icon" size={36} strokeWidth={1.5} />
              <h3 className="team-approach__title">{v.title}</h3>
              <p className="team-approach__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
