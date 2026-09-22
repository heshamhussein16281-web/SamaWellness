/* Services Page — Locked Variant B
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Our Services — Individual, Couples & Group Therapy, In-Person & Online | Sama Wellness Therapy",
  description: "Individual, couples & group therapy — in-person at our New Giza clinic or online across Egypt & Saudi Arabia. Matched with the right therapist through a free assessment.",
  alternates: {
    canonical: "/services",
    languages: { en: "/services", ar: "/ar/services", "x-default": "/services" },
  },
  openGraph: {
    title: "Our Services — Individual, Couples & Group Therapy, In-Person & Online | Sama Wellness Therapy",
    description: "Individual, couples & group therapy — in-person at our New Giza clinic or online across Egypt & Saudi Arabia. Matched with the right therapist through a free assessment.",
    url: "https://www.samawellnesstherapy.com/services",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import ServicesIntroSplit from "@/components/ServicesIntroSplit";
import Services from "@/components/Services";
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
