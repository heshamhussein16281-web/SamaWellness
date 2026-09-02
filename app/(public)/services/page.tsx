/* Services Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";
import ServicesIntroSplit from "@/components/ServicesIntroSplit";
import Services from "@/components/Services";
import Process from "@/components/Process";
import WhoIsThisForGrid from "@/components/WhoIsThisForGrid";
import TestimonialsServices from "@/components/TestimonialsServices";
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
