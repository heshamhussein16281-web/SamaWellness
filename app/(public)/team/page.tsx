/* Team Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import Script from "next/script";
import PageHero from "@/components/PageHero";
import { therapists } from "@/lib/team-data";

export const metadata: Metadata = {
  title: "Licensed Therapists in New Giza & Online | Sama Wellness",
  description: "Meet our licensed therapists at our New Giza clinic, near Sheikh Zayed & 6th of October. Individual and couples therapy, starting with a free 15-min assessment to match you with the right therapist.",
  alternates: {
    canonical: "/team",
    languages: { en: "/team", ar: "/ar/team", "x-default": "/team" },
  },
  openGraph: {
    title: "Licensed Therapists in New Giza & Online | Sama Wellness",
    description: "Meet our licensed therapists at our New Giza clinic, near Sheikh Zayed & 6th of October. Individual and couples therapy, starting with a free 15-min assessment to match you with the right therapist.",
    url: "https://www.samawellnesstherapy.com/team",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import TeamIntroSplit from "@/components/TeamIntroSplit";
import Team from "@/components/Team";
import TeamApproach from "@/components/TeamApproach";
import TestimonialsTeam from "@/components/TestimonialsTeam";
import MidCTA from "@/components/MidCTA";
import FinalCTA from "@/components/FinalCTA";

const teamJsonLd = {
  "@context": "https://schema.org",
  "@graph": therapists.map((t) => ({
    "@type": "Person",
    name: t.name,
    jobTitle: t.title,
    description: t.approach,
    image: `https://www.samawellnesstherapy.com${t.image}`,
    worksFor: {
      "@type": "MedicalBusiness",
      name: "Sama Wellness Therapy",
      url: "https://www.samawellnesstherapy.com",
    },
  })),
};

export default function TeamPage() {
  return (
    <>
      <Script
        id="team-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }}
      />
      <PageHero eyebrow="Your Therapists" title="Meet the Team" />
      <ScrollReveal>
        <TeamIntroSplit />
      </ScrollReveal>
      <ScrollReveal>
        <Team />
      </ScrollReveal>
      <MidCTA />
      <ScrollReveal>
        <TeamApproach />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsTeam />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
