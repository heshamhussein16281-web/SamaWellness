/* الصفحة الرئيسية — Arabic Homepage
   Hero → ValuesStrip → HowItWorksIcons → TeaserGrid → StatsStripDark → TestimonialsRotating
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
"use client";
import { useEffect } from "react";
import HeroAr from "@/components/ar/HeroAr";
import ScrollReveal from "@/components/ScrollReveal";
import ValuesStripAr from "@/components/ar/ValuesStripAr";
import HowItWorksIconsAr from "@/components/ar/HowItWorksIconsAr";
import TeaserGridAr from "@/components/ar/TeaserGridAr";
import StatsStripDarkAr from "@/components/ar/StatsStripDarkAr";
import TestimonialsRotatingAr from "@/components/ar/TestimonialsRotatingAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

export default function HomeAr() {
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      const scrollTop = window.innerWidth > 768 ? 120 : 60;
      window.scrollTo({ top: scrollTop, behavior: "auto" });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <>
      <HeroAr />
      <ScrollReveal>
        <ValuesStripAr />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorksIconsAr />
      </ScrollReveal>
      <ScrollReveal>
        <TeaserGridAr />
      </ScrollReveal>
      <ScrollReveal>
        <StatsStripDarkAr />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsRotatingAr />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTAAr />
      </ScrollReveal>
    </>
  );
}
