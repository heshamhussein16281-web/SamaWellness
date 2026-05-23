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
 * TherapistCard — Horizontal layout component
 *
 * Props:
 *   therapist: Therapist object with id, name, title, approach, image, bio, specializations
 *
 * Features:
 *   - Photo on left (200px) spanning 2 rows, zoom on hover
 *   - Name, title, approach on right (rows 1-2, right column)
 *   - Bio full width below (row 3), with inline "Read Full Bio" button
 *   - Specializations full width (row 4) with "Specialized In" header
 *
 * Structure (BEM):
 *   .team-card (article) — 4-row, 2-column grid
 *     ├─ .team-card__photo-wrap (div) — rows 1-2, col 1
 *     │  └─ .team-card__photo (img)
 *     ├─ .team-card__header-and-approach (div) — rows 1-2, col 2
 *     │  ├─ .team-card__header
 *     │  │  ├─ .team-card__name (p)
 *     │  │  ├─ .team-card__title (p)
 *     │  │  └─ .team-card__divider (div)
 *     │  └─ .team-card__approach (p)
 *     ├─ .team-card__bio-section (div) — row 3, cols 1-2
 *     │  └─ .team-card__bio-container (div) — line-clamped to 5 lines
 *     │     └─ .team-card__bio (p) — inline bio text + button
 *     │        └─ .team-card__read-more (button) — inline after text
 *     └─ .team-card__specializations (div) — row 4, cols 1-2
 *        ├─ .team-card__tags-label (p)
 *        └─ .team-card__tags (div)
 *           └─ .team-card__tag (span, repeated)
 */
function TherapistCard({ therapist }: { therapist: typeof therapists[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="team-card">

      {/* ───────────────────────────────────
          Photo Frame (Grid: rows 1-2, col 1)
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
          Header + Approach (Grid: rows 1-2, col 2)
          ─────────────────────────────────── */}
      <div className="team-card__header-and-approach">
        <div className="team-card__header">
          <h3 className="team-card__name">{therapist.name}</h3>
          <p className="team-card__title">{therapist.title}</p>
          <div className="team-card__divider"></div>
        </div>
        <p className="team-card__approach">{therapist.approach}</p>
      </div>

      {/* ───────────────────────────────────
          Bio (Grid: row 3, cols 1-2)
          ─────────────────────────────────── */}
      <div className="team-card__bio-section">
        <div className={`team-card__bio-container${expanded ? " expanded" : ""}`}>
          <p className="team-card__bio">{therapist.bio}</p>
        </div>
        <button
          className="team-card__read-more"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Read less" : "Read Full Bio →"}
        </button>
      </div>

      {/* ───────────────────────────────────
          Specializations (Grid: row 4, cols 1-2)
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
 *   - Inner container: Max-width 1550px, centered, padded
 *   - Heading: Centered, responsive font size
 *   - Grid: 2 columns of horizontal therapist cards
 *
 * Responsive:
 *   - Desktop: 2 columns with horizontal layout (photo left, content right)
 *   - Tablet (980px): 2 columns, cards start stacking
 *   - Mobile (560px): 1 column, photo stacks on top
 *
 * CSS Classes:
 *   .team-section (LAYER 2: layout, LAYER 3: visual)
 *   .team-section__inner (LAYER 2: container with max-width)
 *   .team-section__heading (LAYER 3: typography)
 *   .team-section__row (LAYER 2: 2-column grid)
 *
 * Children: TherapistCard (all 7 therapists in one grid)
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
            Therapist Grid: 2 columns (horizontal cards)
            ─────────────────────────────────── */}
        <div className="team-section__row">
          {therapists.map((t) => (
            <TherapistCard key={t.id} therapist={t} />
          ))}
        </div>

      </div>
    </section>
  );
}
