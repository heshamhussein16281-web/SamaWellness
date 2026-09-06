/* Ask Sama + FAQ Page — Locked Variant B (centered intro)
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "FAQ & Ask Counselor Sama | Sama Wellness Therapy",
  description: "Find answers to common therapy questions and ask Counselor Sama directly. Learn about our assessment process, confidentiality, and what to expect at Sama Wellness Therapy.",
  alternates: {
    canonical: "/ask",
    languages: { en: "/ask", ar: "/ar/ask" },
  },
  openGraph: {
    title: "FAQ & Ask Counselor Sama | Sama Wellness Therapy",
    description: "Find answers to common therapy questions and ask Counselor Sama directly at Sama Wellness Therapy in New Giza, Cairo.",
    url: "https://www.samawellnesstherapy.com/ask",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import AskSamaGalleryIntro from "@/components/AskSamaGalleryIntro";
import FAQAccordion from "@/components/FAQAccordion";
import AskCounselorSama from "@/components/AskCounselorSama";
import FinalCTA from "@/components/FinalCTA";

export default function AskPage() {
  return (
    <>
      <PageHero eyebrow="Get Answers" title="Your Questions, Answered" />
      <ScrollReveal>
        <AskSamaGalleryIntro />
      </ScrollReveal>
      <ScrollReveal>
        <FAQAccordion />
      </ScrollReveal>
      <ScrollReveal>
        <AskCounselorSama />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
