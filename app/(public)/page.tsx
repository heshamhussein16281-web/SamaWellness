/* Homepage — Locked multi-page structure
   Hero → ValuesStrip → HowItWorksIcons → TeaserGrid → StatsStripDark → TestimonialsRotating
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
"use client";
import { useEffect } from "react";
import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import ValuesStrip from "@/components/ValuesStrip";
import HowItWorksIcons from "@/components/HowItWorksIcons";
import TeaserGrid from "@/components/TeaserGrid";
import StatsStripDark from "@/components/StatsStripDark";
import TestimonialsRotating from "@/components/TestimonialsRotating";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      const scrollTop = window.innerWidth > 768 ? 120 : 60;
      window.scrollTo({ top: scrollTop, behavior: "auto" });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <>
      <Hero />
      <ScrollReveal>
        <ValuesStrip />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorksIcons />
      </ScrollReveal>
      <ScrollReveal>
        <TeaserGrid />
      </ScrollReveal>
      <ScrollReveal>
        <StatsStripDark />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsRotating />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
