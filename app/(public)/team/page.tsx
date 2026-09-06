/* Team Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Meet the Team — 8 Licensed Therapists | Sama Wellness Therapy",
  description: "Meet the 8 licensed therapists at Sama Wellness Therapy in New Giza, Cairo. Led by Clinical Director Sama Eissa, each therapist is personally matched to your needs.",
  alternates: {
    canonical: "/team",
    languages: { en: "/team", ar: "/ar/team" },
  },
  openGraph: {
    title: "Meet the Team — 8 Licensed Therapists | Sama Wellness Therapy",
    description: "Meet the 8 licensed therapists at Sama Wellness Therapy in New Giza, Cairo. Led by Clinical Director Sama Eissa.",
    url: "https://www.samawellnesstherapy.com/team",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import TeamIntroSplit from "@/components/TeamIntroSplit";
import Team from "@/components/Team";
import TeamApproach from "@/components/TeamApproach";
import TestimonialsTeam from "@/components/TestimonialsTeam";
import FinalCTA from "@/components/FinalCTA";

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow="Your Therapists" title="Meet the Team" />
      <ScrollReveal>
        <TeamIntroSplit />
      </ScrollReveal>
      <ScrollReveal>
        <Team />
      </ScrollReveal>
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
