/* Final CTA Strip — closing conversion nudge before footer */

export default function FinalCTA() {
  return (
    <section className="final-cta" aria-label="Book Your Assessment">
      <div className="final-cta__inner">
        <h2 className="final-cta__heading">Ready to Take the First Step?</h2>
        <p className="final-cta__desc">
          Book a free 15-minute assessment and get matched with the right therapist.
        </p>
        <a
          href="https://api.whatsapp.com/send?phone=201130946556&text=I%27d%20like%20to%20book%20an%20assessment"
          target="_blank"
          rel="noopener noreferrer"
          className="final-cta__button"
        >
          Book Your Assessment
        </a>
      </div>
    </section>
  );
}
