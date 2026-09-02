/* Ask Sama + FAQ Page — Locked Variant B (centered intro)
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import PageHero from "@/components/PageHero";
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
