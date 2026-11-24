/* Services Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Therapy & Counseling Services in New Giza | Sama Wellness",
  description: "Individual, couples, child & teen therapy and psychiatry at our New Giza clinic, near Sheikh Zayed & 6th of October. Start with a free 15-minute assessment.",
  alternates: {
    canonical: "/services",
    languages: { en: "/services", ar: "/ar/services", "x-default": "/services" },
  },
  openGraph: {
    title: "Therapy & Counseling Services in New Giza | Sama Wellness",
    description: "Individual, couples, child & teen therapy and psychiatry at our New Giza clinic, near Sheikh Zayed & 6th of October. Start with a free 15-minute assessment.",
    url: "https://www.samawellnesstherapy.com/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Therapy & Counseling Services in New Giza | Sama Wellness",
    description: "Individual, couples, child & teen therapy and psychiatry at our New Giza clinic, near Sheikh Zayed & 6th of October. Start with a free 15-minute assessment.",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import ServicesIntroSplit from "@/components/ServicesIntroSplit";
import Services from "@/components/Services";
import WhatWeTreat from "@/components/WhatWeTreat";
import Process from "@/components/Process";
import WhoIsThisForGrid from "@/components/WhoIsThisForGrid";
import TestimonialsServices from "@/components/TestimonialsServices";
import MidCTA from "@/components/MidCTA";
import FinalCTA from "@/components/FinalCTA";

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="What We Offer" title="Our Services" />
      <ScrollReveal>
        <ServicesIntroSplit />
      </ScrollReveal>
      <ScrollReveal>
        <Services />
      </ScrollReveal>
      <ScrollReveal>
        <WhatWeTreat />
      </ScrollReveal>
      <MidCTA />
      <ScrollReveal>
        <Process />
      </ScrollReveal>
      <ScrollReveal>
        <WhoIsThisForGrid />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsServices />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
