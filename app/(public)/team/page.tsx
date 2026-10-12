/* Team Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import Script from "next/script";
import PageHero from "@/components/PageHero";
import { therapists } from "@/lib/team-data";

export const metadata: Metadata = {
  title: "Meet the Team — 9 Licensed Therapists | Sama Wellness Therapy",
  description: "Meet the 9 licensed therapists at Sama Wellness Therapy, New Giza. Led by Counselor Sama Eissa, each therapist is matched to your needs.",
  alternates: {
    canonical: "/team",
    languages: { en: "/team", ar: "/ar/team", "x-default": "/team" },
  },
  openGraph: {
    title: "Meet the Team — 9 Licensed Therapists | Sama Wellness Therapy",
    description: "Meet the 9 licensed therapists at Sama Wellness Therapy in New Giza, Cairo. Led by Clinical Director Sama Eissa.",
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
