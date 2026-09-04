import { UserCheck, ShieldCheck, Leaf } from "lucide-react";

const values = [
  {
    icon: UserCheck,
    title: "مُختار خصيصاً ليك",
    desc: "الكاونسلر سما بتختار المعالج المناسب ليك بنفسها بناءً على تقييم ١٥ دقيقة — مفيش اختيار عشوائي.",
  },
  {
    icon: ShieldCheck,
    title: "سرية تامة",
    desc: "كل اللي بتشاركه بيفضل محمي. رعاية مرخصة، أخلاقية، وسرية بالكامل.",
  },
  {
    icon: Leaf,
    title: "مساحة هدوء وتعافي",
    desc: "عيادتنا في نيو جيزة مصممة تحسسك بالهدوء والراحة من أول لحظة.",
  },
];

export default function ValuesStripAr() {
  return (
    <section className="values-strip" aria-label="قيمنا">
      <div className="values-strip__grid">
        {values.map((v) => (
          <div className="values-strip__card" key={v.title}>
            <span className="values-strip__icon">
              <v.icon size={48} strokeWidth={1.5} />
            </span>
            <h3 className="values-strip__title">{v.title}</h3>
            <p className="values-strip__desc">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
