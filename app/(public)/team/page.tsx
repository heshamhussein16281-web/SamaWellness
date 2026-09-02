/* Team Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import PageHero from "@/components/PageHero";
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
