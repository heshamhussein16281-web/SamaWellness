/* Mid-page CTA — lightweight booking nudge placed at ~50% scroll depth
   so visitors who don't scroll to FinalCTA still see a conversion prompt.

   "use client" only so the WhatsApp link can read the Google Ads source
   tag from localStorage (see lib/sourceTag.ts) and append the " ·G" marker
   when applicable — no other behavior changes. href starts at the plain
   default (matches server-rendered markup) and is patched in useEffect
   after mount, avoiding any hydration mismatch. */
"use client";
import { useState, useEffect } from "react";
import { appendSourceSuffix } from "@/lib/sourceTag";

const WA_BASE = "https://api.whatsapp.com/send?phone=201130946556&text=";
const TEXT_DEFAULT = "I%27d%20like%20to%20book%20an%20assessment";

export default function MidCTA() {
  const [href, setHref] = useState(WA_BASE + TEXT_DEFAULT);

  useEffect(() => {
    setHref(WA_BASE + appendSourceSuffix(TEXT_DEFAULT));
  }, []);

  return (
    <section className="mid-cta" aria-label="Book an assessment">
      <div className="mid-cta__inner">
        <p className="mid-cta__text">
          Not sure where to start?&ensp;
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mid-cta__link"
          >
            Book a 15-min assessment&nbsp;&rarr;
          </a>
        </p>
      </div>
    </section>
  );
}
