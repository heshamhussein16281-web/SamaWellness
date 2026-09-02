/* Team Intro — Option B: Sama photo left, philosophy right */

export default function TeamIntroSplit() {
  return (
    <section className="services-intro-split" aria-label="About Our Team">
      <div className="services-intro-split__inner">
        <div className="services-intro-split__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sama2_nobg.png" alt="Sama Eissa — Clinical Director" className="services-intro-split__image" style={{ objectFit: "contain", backgroundColor: "var(--color-sand)" }} />
        </div>
        <div className="services-intro-split__text">
          <h2 className="services-intro-split__heading">Led by Counselor Sama</h2>
          <p className="services-intro-split__desc">
            Sama Eissa founded Sama Wellness with one belief: healing starts when you feel
            truly understood. With a Master&apos;s in Counseling Psychology from AUC, she personally
            assesses every client and hand-selects their therapist.
          </p>
          <p className="services-intro-split__desc">
            Our team of 8 licensed therapists shares that same philosophy — no generic approaches,
            no random assignments. Just deeply personal, evidence-based care.
          </p>
        </div>
      </div>
    </section>
  );
}
