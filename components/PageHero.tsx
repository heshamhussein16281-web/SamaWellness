/* ========================================
   PAGE HERO COMPONENT (draft — for review)

   Purpose: Slim banner used at the top of interior pages
   (Services, Team, Rooms, Ask Sama, Contact) so each route
   reads as its own place rather than a bare content grid.

   Structure (BEM):
   .page-hero
     ├─ .page-hero__eyebrow   — uppercase label, same treatment as hero-text-elevate
     ├─ .page-hero__title     — Gilda Display serif heading
     └─ .page-hero__rule      — thin decorative underline
   ======================================== */

export default function PageHero({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="page-hero">
      <p className="page-hero__eyebrow">{eyebrow}</p>
      <h1 className="page-hero__title">{title}</h1>
      <div className="page-hero__rule" />
    </div>
  );
}
