/* ========================================
   TEAM SECTION COMPONENT
   
   Structure:
   - Team grid: 4 columns of therapist cards (responsive 2→1 on mobile)
   - Each card: Photo frame (250×355), name, title, collapsible bio, specializations
   
   Design System Integration:
   - Photo frame: --team-photo-width, --team-photo-height, --team-photo-radius (CSS)
   - Grid gap: --team-col-gap (CSS)
   - Padding: --team-pad-x, --team-pad-y (CSS)
   - Typography: var(--font-display), var(--font-body), var(--font-ui) (CSS)
   - Colors: var(--color-*) (CSS)
   
   Responsive:
   - Desktop: 4 columns
   - Tablet (980px): 2 columns
   - Mobile (560px): 1 column
   
   Interactions:
   - Photo zoom on hover (scale 1.05)
   - Bio collapse/expand toggle
   
   Dependencies: @/lib/team-data (therapist data)
   ======================================== */

"use client";
import { useState } from "react";
import { therapists } from "@/lib/team-data";

/**
 * TherapistCard — Self-contained component
 * 
 * Props:
 *   therapist: Therapist object with id, name, title, image, bio, specializations
 * 
 * Features:
 *   - Photo frame: 250×355px with rounded corners, zoom on hover
 *   - Name & Title: Display therapist name and professional title
 *   - Bio: Shows first sentence by default, expands to full text on click
 *   - Specializations: Tags showing areas of expertise
 * 
 * State:
 *   expanded: Boolean controlling bio expansion
 * 
 * Structure (BEM):
 *   .team-card (article)
 *     ├─ .team-card__photo-wrap (div)
 *     │  └─ .team-card__photo (img)
 *     ├─ .team-card__name (p)
 *     ├─ .team-card__title (p)
 *     ├─ .team-card__bio (p)
 *     ├─ .team-card__read-more (button, if bio has multiple sentences)
 *     └─ .team-card__specializations (div)
 *        ├─ .team-card__tags-label (p)
 *        └─ .team-card__tags (div)
 *           └─ .team-card__tag (span, repeated)
 */
function TherapistCard({ therapist }: { therapist: typeof therapists[0] }) {
  const [expanded, setExpanded] = useState(false);

  // Extract first sentence as preview, rest as expandable content
  const firstSentenceEnd = therapist.bio.indexOf(". ") + 1;
  const bioPreview = firstSentenceEnd > 1 
    ? therapist.bio.slice(0, firstSentenceEnd) 
    : therapist.bio;
  const bioRest = firstSentenceEnd > 1 
    ? therapist.bio.slice(firstSentenceEnd).trim() 
    : "";
  const hasBioRest = bioRest.length > 0;

  return (
    <article className="team-card">

      {/* ───────────────────────────────────
          Photo Frame (250×355, rounded corners, zoom)
          ─────────────────────────────────── */}
      <div className="team-card__photo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={therapist.image}
          alt={therapist.name}
          className="team-card__photo"
        />
      </div>

      {/* ───────────────────────────────────
          Name & Title
          ─────────────────────────────────── */}
      <p className="team-card__name">{therapist.name}</p>
      <p className="team-card__title">{therapist.title}</p>

      {/* ───────────────────────────────────
          Bio (Collapsible)
          ─────────────────────────────────── */}
      <p className="team-card__bio">
        {bioPreview}
        {expanded && ` ${bioRest}`}
      </p>

      {/* Read More/Less Button (only if bio has multiple sentences) */}
      {hasBioRest && (
        <button
          className="team-card__read-more"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      {/* ───────────────────────────────────
          Specializations (Tags)
          ─────────────────────────────────── */}
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

/**
 * Team — Section Component
 * 
 * Layout:
 *   - Section: Full-width with linen background, top border
 *   - Inner container: Max-width 1400px, centered, padded
 *   - Heading: Centered, responsive font size
 *   - Row 1: First 4 therapists (slice 0-4)
 *   - Divider: Sand-colored line between rows
 *   - Row 2: Last 4 therapists (slice 4-8)
 * 
 * Responsive:
 *   - Desktop: 4 columns (--team-col-gap)
 *   - Tablet: 2 columns (28px gap)
 *   - Mobile: 1 column
 * 
 * CSS Classes:
 *   .team-section (LAYER 2: layout, LAYER 3: visual)
 *   .team-section__inner (LAYER 2: container with max-width)
 *   .team-section__heading (LAYER 3: typography)
 *   .team-section__row (LAYER 2: 4-column grid)
 *   .team-section__divider (LAYER 2: spacing, LAYER 3: color/height)
 * 
 * Children: TherapistCard (repeated 8 times)
 */
export default function Team() {
  return (
    <section id="team" className="team-section" aria-label="Our Team of Wellness Experts">
      <div className="team-section__inner">

        {/* ───────────────────────────────────
            Section Heading
            ─────────────────────────────────── */}
        <h2 className="team-section__heading">
          The Team Dedicated to Your Wellness
        </h2>

        {/* ───────────────────────────────────
            Row 1: Therapists 1–4
            ─────────────────────────────────── */}
        <div className="team-section__row">
          {therapists.slice(0, 4).map((t) => (
            <TherapistCard key={t.id} therapist={t} />
          ))}
        </div>

        {/* ───────────────────────────────────
            Visual Divider (Sand color, separates rows)
            ─────────────────────────────────── */}
        <div className="team-section__divider" />

        {/* ───────────────────────────────────
            Row 2: Therapists 5–8
            ─────────────────────────────────── */}
        <div className="team-section__row">
          {therapists.slice(4, 8).map((t) => (
            <TherapistCard key={t.id} therapist={t} />
          ))}
        </div>

      </div>
    </section>
  );
}
