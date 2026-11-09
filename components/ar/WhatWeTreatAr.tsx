/* بنساعدك في — قائمة الحالات لصفحة الخدمات (عربي) */

const conditions = [
  "القلق",
  "الرهاب الاجتماعي",
  "الاكتئاب",
  "الوسواس القهري",
  "التوتر والضغط النفسي",
  "الصدمات النفسية واضطراب ما بعد الصدمة",
  "اضطراب ثنائي القطب",
  "فرط الحركة وتشتت الانتباه",
  "الأطفال والمراهقين",
  "العلاقات الزوجية",
  "العلاج الأسري",
  "الحزن والفقد",
  "ضعف الثقة بالنفس",
  "اضطرابات الشخصية",
  "اضطرابات الأكل",
];

export default function WhatWeTreatAr() {
  return (
    <section className="what-we-treat" aria-label="بنساعدك في">
      <div className="what-we-treat__inner">
        <h2 className="what-we-treat__heading">بنساعدك في</h2>
        <p className="what-we-treat__intro">
          معالجينا المعتمدين بيدعموا الكبار والمراهقين والأطفال والأزواج والعائلات في:
        </p>
        <div className="what-we-treat__chips">
          {conditions.map((c) => (
            <span className="what-we-treat__chip" key={c}>
              {c}
            </span>
          ))}
        </div>
        <p className="what-we-treat__note">
          من أساليب العلاج: العلاج المعرفي السلوكي، العلاج الجدلي السلوكي، علاج المخططات، EMDR،
          الجشطالت والتحليل النفسي — وبنختارلك المعالج المناسب بعد تقييم ١٥ دقيقة.
        </p>
      </div>
    </section>
  );
}
