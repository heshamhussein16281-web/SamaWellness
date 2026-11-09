/* What We Treat — conditions list for Services page (EN) */

const conditions = [
  "Anxiety",
  "Social Anxiety",
  "Depression",
  "OCD",
  "Stress",
  "Trauma & PTSD",
  "Bipolar Disorder",
  "ADHD",
  "Children & Teens",
  "Couples & Marriage",
  "Family Therapy",
  "Grief & Loss",
  "Low Self-Esteem",
  "Personality Disorders",
  "Eating Disorders",
];

export default function WhatWeTreat() {
  return (
    <section className="what-we-treat" aria-label="What We Treat">
      <div className="what-we-treat__inner">
        <h2 className="what-we-treat__heading">What We Treat</h2>
        <p className="what-we-treat__intro">
          Our licensed therapists support adults, teens, children, couples and families with:
        </p>
        <div className="what-we-treat__chips">
          {conditions.map((c) => (
            <span className="what-we-treat__chip" key={c}>
              {c}
            </span>
          ))}
        </div>
        <p className="what-we-treat__note">
          Approaches include CBT, DBT, Schema Therapy, EMDR, Gestalt and psychoanalytic therapy —
          your therapist is matched to you after your 15-minute assessment.
        </p>
      </div>
    </section>
  );
}
