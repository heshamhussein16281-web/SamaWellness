"use client";
import { useState } from "react";
import { therapistsAr as therapists } from "@/lib/team-data-ar";
import BookingModalAr from "./BookingModalAr";

function TherapistCardAr({ therapist }: { therapist: typeof therapists[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

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

      <div className="team-card__header-and-approach">
        <div className="team-card__header">
          <div className="team-card__header-top">
            <div>
              <h3 className="team-card__name">{therapist.name}</h3>
              <p className="team-card__title">{therapist.title}</p>
            </div>
            <button
              className="team-card__book-btn"
              onClick={() => setShowBooking(true)}
            >
              احجز
            </button>
          </div>
          <div className="team-card__divider"></div>
        </div>
        <p className="team-card__approach">{therapist.approach}</p>
      </div>

      {showBooking && (
        <BookingModalAr
          therapist={therapist}
          onClose={() => setShowBooking(false)}
        />
      )}

      <div className="team-card__bio-section">
        <div className={`team-card__bio-container${expanded ? " expanded" : ""}`}>
          <p className="team-card__bio">{therapist.bio}</p>
        </div>
        <button
          className="team-card__read-more"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "اقرأ أقل" : "اقرأ السيرة الكاملة →"}
        </button>
      </div>

      <div className="team-card__specializations">
        <p className="team-card__tags-label">متخصص في</p>
        <div className="team-card__tags">
          {therapist.specializations.map((s) => (
            <span key={s} className="team-card__tag">{s}</span>
          ))}
        </div>
      </div>

    </article>
  );
}

export default function TeamAr() {
  return (
    <section id="team" className="team-section" aria-label="فريق خبراء الصحة النفسية">
      <div className="team-section__inner">

        <h2 className="team-section__heading">
          الفريق المهتم بصحتك
        </h2>

        <div className="team-section__row">
          {therapists.map((t) => (
            <TherapistCardAr key={t.id} therapist={t} />
          ))}
        </div>

      </div>
    </section>
  );
}
