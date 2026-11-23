/* Mid-page CTA (Arabic) — lightweight booking nudge at ~50% scroll depth.

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
const TEXT_DEFAULT = "%D8%A3%D8%AD%D8%A8%20%D8%A3%D8%AD%D8%AC%D8%B2%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85";

export default function MidCTAAr() {
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
    <section className="mid-cta" aria-label="احجز تقييم مجاني">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          مش متأكد تبدأ منين؟&ensp;
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mid-cta__link"
            onClick={handleClick}
          >
            احجز تقييم مجاني ١٥ دقيقة&nbsp;&larr;
          </a>
        </p>
      </div>
    </section>
  );
}
