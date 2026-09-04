export default function ServicesIntroSplitAr() {
  return (
    <section className="services-intro-split" aria-label="منهجنا">
      <div className="services-intro-split__inner">
        <div className="services-intro-split__text">
          <h2 className="services-intro-split__heading">علاج بيقابلك في مكانك</h2>
          <p className="services-intro-split__desc">
            في ساما ويلنس، بنؤمن إن التعافي بيبدأ لما تحس إنك مفهوم فعلاً. معالجينا المرخصين بيقدموا علاج فردي، زوجي، وجماعي — كل منهج بيتم اختياره شخصياً حسب احتياجاتك من خلال تقييم مجاني ١٥ دقيقة مع الكاونسلر سما.
          </p>
          <p className="services-intro-split__desc">
            سواء بتواجه قلق، تحديات في العلاقات، أو بتدور على مساحة حد يسمعك — إحنا هنا نمشي جنبك.
          </p>
        </div>
        <div className="services-intro-split__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rooms-serenity1.jpg" alt="مساحة العلاج في ساما ويلنس" className="services-intro-split__image" />
        </div>
      </div>
    </section>
  );
}
