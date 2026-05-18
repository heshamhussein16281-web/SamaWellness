"use client";
import { useState } from "react";
import { therapists } from "@/lib/team-data";

function TherapistCard({ therapist }: { therapist: typeof therapists[0] }) {
  const [expanded, setExpanded] = useState(false);

  const firstSentenceEnd = therapist.bio.indexOf(". ") + 1;
  const bioPreview = firstSentenceEnd > 1 ? therapist.bio.slice(0, firstSentenceEnd) : therapist.bio;
  const bioRest = firstSentenceEnd > 1 ? therapist.bio.slice(firstSentenceEnd).trim() : "";
  const hasBioRest = bioRest.length > 0;

  return (
    <article className="team-card">

      <div className="team-card__photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={therapist.image}
          alt={therapist.name}
          className="team-card__photo"
        />
      </div>

      <p className="team-card__name">{therapist.name}</p>
      <p className="team-card__title">{therapist.title}</p>

      <p className="team-card__bio">
        {bioPreview}
        {expanded && ` ${bioRest}`}
      </p>

      {hasBioRest && (
        <button
          className="team-card__read-more"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      <div className="team-card__specializations">
        <p className="team-card__tags-label">Specialized In</p>
        <div className="team-card__tags">
          {therapist.specializations.map((s) => (
            <span key={s} className="team-card__tag">{s}</span>
          ))}
        </div>
      </div>

    </article>
  );
}

export default function Team() {
  return (
    <section id="team" className="team-section">
      <div className="team-section__inner">

        <h2 className="team-section__heading">
          The Team Dedicated to Your Wellness
        </h2>

        <div className="team-section__row team-grid">
          {therapists.slice(0, 4).map((t) => (
            <TherapistCard key={t.id} therapist={t} />
          ))}
        </div>

        <div className="team-section__divider" />

        <div className="team-section__row team-grid">
          {therapists.slice(4, 8).map((t) => (
            <TherapistCard key={t.id} therapist={t} />
          ))}
        </div>

      </div>
    </section>
  );
}
