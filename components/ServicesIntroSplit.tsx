/* Services Intro — Option B: Text left, image right */

export default function ServicesIntroSplit() {
  return (
    <section className="services-intro-split" aria-label="Our Approach">
      <div className="services-intro-split__inner">
        <div className="services-intro-split__text">
          <h2 className="services-intro-split__heading">Therapy That Meets You Where You Are</h2>
          <p className="services-intro-split__desc">
            At Sama Wellness, we believe healing starts when you feel truly understood.
            Our licensed therapists offer individual, couple, and group therapy — each
            approach personally matched to your needs through a free 15-minute assessment
            with Counselor Sama.
          </p>
          <p className="services-intro-split__desc">
            Whether you are navigating anxiety, relationship challenges, or simply seeking
            a space to be heard — we are here to walk alongside you.
          </p>
        </div>
        <div className="services-intro-split__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rooms-serenity1.jpg" alt="Therapy space at Sama Wellness" className="services-intro-split__image" />
        </div>
      </div>
    </section>
  );
}
