"use client";
import { useEffect } from "react";
import Hero from "@/components/Hero";
import ValuesStrip from "@/components/ValuesStrip";
import TeaserGrid from "@/components/TeaserGrid";

export default function Home() {
  useEffect(() => {
    // On page load, scroll to show full hero section
    // Use setTimeout to ensure DOM is fully rendered
    const scrollTimer = setTimeout(() => {
      // Adjust scroll position based on viewport: desktop 120px, mobile 60px
      const scrollTop = window.innerWidth > 768 ? 120 : 60;
      window.scrollTo({ top: scrollTop, behavior: "auto" });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <div className="home-tight">
      <Hero />
      <ValuesStrip />
      <TeaserGrid />
    </div>
  );
}
