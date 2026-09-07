/* Mid-page CTA — lightweight booking nudge placed at ~50% scroll depth
   so visitors who don't scroll to FinalCTA still see a conversion prompt. */

export default function MidCTA() {
  return (
    <section className="mid-cta" aria-label="Book a free assessment">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          Not sure where to start?&ensp;
          <a
            href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="mid-cta__link"
          >
            Book a free 15-min assessment&nbsp;&rarr;
          </a>
        </p>
      </div>
    </section>
  );
}
