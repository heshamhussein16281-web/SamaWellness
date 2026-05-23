/* ========================================
   SERVICES SECTION COMPONENT
   
   Structure:
   - Section: Sand background, heading, 3-column grid of service cards
   - Each card: Equal height (via grid align-items: stretch), image, title, description
   
   Design System Integration:
   - Background: var(--color-sand) (CSS)
   - Grid: 3 columns, gap: --services-gap
   - Card padding: --services-card-pad
   - Image height: --services-img-height (220px)
   - Image radius: --services-img-radius (4px)
   - Typography: var(--font-display), var(--font-body)
   - Colors: var(--color-*)
   
   Responsive:
   - Desktop: 3 columns
   - Tablet (980px): 1 column
   - Mobile: 1 column
   
   Interactions:
   - Image zoom on hover (scale 1.04)
   
   Static Content:
   - Services data hardcoded (3 therapy types)
   ======================================== */

"use client";

/**
 * Service Data
 * 
 * Static array of 3 therapy services.
 * Structure:
 *   - title: Service name (displayed in .service-card__title)
 *   - desc: Service description (displayed in .service-card__desc)
 *   - image: Path to service image in public/ folder
 * 
 * Note: Images are displayed with object-fit: cover in a 100% width,
 * 220px height frame. Aspect ratio doesn't matter — image is cropped.
 */
const services = [
  {
    title: "Individual Therapy",
    desc: "Focused one-on-one sessions helping you explore personal challenges, manage stress, and develop healthy coping strategies in a safe clinical space.",
    image: "/individual-therapy.jpg",
  },
  {
    title: "Couple Therapy",
    desc: "Professional guidance for partners looking to improve communication, resolve recurring conflicts, and build a stronger relational foundation together.",
    image: "/couple-therapy.jpg",
  },
  {
    title: "Group Therapy",
    desc: "Healing within a clinically guided community. Shared experiences provide mutual support and diverse perspectives on your path to wellness.",
    image: "/group-therapy.jpg",
  },
];

/**
 * Services — Section Component
 * 
 * Layout:
 *   - Section: Full-width sand background
 *   - Heading: Centered, responsive font
 *   - Grid: 3 equal-width columns, equal-height cards
 * 
 * Responsive:
 *   - Desktop: 3 columns
 *   - Tablet (980px): 1 column
 * 
 * CSS Classes:
 *   .services-section (LAYER 2: padding, LAYER 3: background)
 *   .services-section__heading (LAYER 3: typography, text-align)
 *   .services-section__grid (LAYER 2: 3-column grid, align-items: stretch)
 *   .service-card (LAYER 3: height: 100%, flex column, background)
 *     ├─ .service-card__image-wrap (LAYER 2: margin inset)
 *     │  └─ .service-card__image (LAYER 3: object-fit: cover)
 *     └─ .service-card__body (LAYER 2: flex: 1, gap)
 *        ├─ .service-card__title (LAYER 3: typography)
 *        └─ .service-card__desc (LAYER 3: typography)
 * 
 * Interactions:
 *   - Image zoom on hover (CSS transition)
 * 
 * Children: Service cards (3, mapped from services array)
 */
export default function Services() {
  return (
    <section
      id="services"
      className="services-section"
      aria-label="Our Services"
    >
      {/* ───────────────────────────────────
          Section Heading
          ─────────────────────────────────── */}
      <div className="services-section__inner">
      <h2 className="services-section__heading">
        Healing Support &amp; Specialized Care
      </h2>

      {/* ───────────────────────────────────
          Services Grid (3 columns, equal height)
          ─────────────────────────────────── */}
      <div className="services-section__grid">
        {services.map((s, i) => (
          <article key={i} className="service-card">

            {/* ──────────────────────────────
                Image Frame (220px height, zoom on hover)
                ────────────────────────────── */}
            <div className="service-card__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                className="service-card__image"
              />
            </div>

            {/* ──────────────────────────────
                Card Body (Title + Description, flexes to fill)
                ────────────────────────────── */}
            <div className="service-card__body">
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
            </div>

          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
