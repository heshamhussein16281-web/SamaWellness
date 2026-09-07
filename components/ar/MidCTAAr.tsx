/* Mid-page CTA (Arabic) — lightweight booking nudge at ~50% scroll depth */

export default function MidCTAAr() {
  return (
    <section className="mid-cta" aria-label="احجز تقييم مجاني">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          مش متأكد تبدأ منين؟&ensp;
          <a
            href="https://api.whatsapp.com/send?phone=201130946556&text=%D8%A3%D8%AD%D8%A8%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85"
            target="_blank"
            rel="noopener noreferrer"
            className="mid-cta__link"
          >
            احجز تقييم مجاني ١٥ دقيقة&nbsp;&larr;
          </a>
        </p>
      </div>
    </section>
  );
}
