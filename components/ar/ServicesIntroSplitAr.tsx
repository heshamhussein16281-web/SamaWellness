import Image from "next/image";

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
          <p className="services-intro-split__desc">
            الجلسات حضوري في عيادتنا بنيو جيزة، قريبة من الشيخ زايد و٦ أكتوبر. وبتشمل الخدمات
            العلاج الفردي والاستشارات الزوجية والجلسات الجماعية. ولعملائنا خارج الجيزة أو في
            السعودية، الجلسات متاحة أونلاين.
          </p>
        </div>
        <div className="services-intro-split__image-wrap">
          <Image
            src="/rooms-serenity1-v3.webp"
            alt="مساحة العلاج في ساما ويلنس"
            width={1240}
            height={828}
            sizes="(max-width: 768px) 100vw, 550px"
            className="services-intro-split__image"
          />
        </div>
      </div>
    </section>
  );
}
