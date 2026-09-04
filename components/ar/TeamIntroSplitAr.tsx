export default function TeamIntroSplitAr() {
  return (
    <section className="services-intro-split" aria-label="عن فريقنا">
      <div className="services-intro-split__inner">
        <div className="services-intro-split__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sama2_nobg.png" alt="سما عيسى — المديرة الإكلينيكية" className="services-intro-split__image" style={{ objectFit: "contain", backgroundColor: "var(--color-sand)" }} />
        </div>
        <div className="services-intro-split__text">
          <h2 className="services-intro-split__heading">بقيادة الكاونسلر سما</h2>
          <p className="services-intro-split__desc">
            سما عيسى أسست ساما ويلنس بإيمان واحد: التعافي بيبدأ لما تحس إنك مفهوم فعلاً. بماجستير في علم النفس الإرشادي من الجامعة الأمريكية بالقاهرة، هي بتقيّم كل عميل بنفسها وبتختار المعالج المناسب ليه.
          </p>
          <p className="services-intro-split__desc">
            فريقنا من ٨ معالجين مرخصين بيشاركوا نفس الفلسفة — مفيش مناهج عامة، مفيش اختيارات عشوائية. بس رعاية شخصية عميقة مبنية على الأدلة.
          </p>
        </div>
      </div>
    </section>
  );
}
