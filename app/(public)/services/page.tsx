import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Services from "@/components/Services";
import Process from "@/components/Process";

export const metadata: Metadata = {
  title: "Our Services | Sama Wellness Therapy",
  description: "Individual, couple, and group therapy, and how our matching process works.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="What We Offer" title="Our Services" />
      <Services />
      <Process />
    </>
  );
}
