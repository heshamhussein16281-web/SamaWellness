/* Mid-page CTA — lightweight booking nudge placed at ~50% scroll depth
   so visitors who don't scroll to FinalCTA still see a conversion prompt.

   "use client" so the WhatsApp link can append this visitor's lead
   reference code (see lib/leadCode.ts) — no other behavior changes. href
   starts at the plain default (matches server-rendered markup) and is
   patched in useEffect after mount, avoiding any hydration mismatch.
   onClick commits a fallback code synchronously if the background fetch
   hasn't resolved yet, so the WhatsApp tab never waits on a network call
   (would otherwise risk mobile popup blockers). */
"use client";
import { useState, useEffect } from "react";
import { appendLeadCode, appendLeadCodeSync, logLeadClick, getResolvedLeadCode } from "@/lib/leadCode";

const WA_BASE = "https://api.whatsapp.com/send?phone=201130946556&text=";
const TEXT_DEFAULT = "I%27d%20like%20to%20book%20an%20assessment";

export default function MidCTA() {
  const [href, setHref] = useState(WA_BASE + TEXT_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const encoded = await appendLeadCode(TEXT_DEFAULT);
      if (!cancelled) setHref(WA_BASE + encoded);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const resolved = getResolvedLeadCode();
    if (!resolved) {
      e.preventDefault();
      window.open(WA_BASE + appendLeadCodeSync(TEXT_DEFAULT), "_blank", "noopener,noreferrer");
      logLeadClick("whatsapp");
      return;
    }
    logLeadClick("whatsapp", resolved);
  };

  return (
    <section className="mid-cta" aria-label="Book a free assessment">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          Not sure where to start?&ensp;
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mid-cta__link"
            onClick={handleClick}
          >
            Book a free 15-min assessment&nbsp;&rarr;
          </a>
        </p>
      </div>
    </section>
  );
}
