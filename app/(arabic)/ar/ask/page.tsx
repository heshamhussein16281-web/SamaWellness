/* صفحة اسأل سما — Arabic Ask Sama + FAQ Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة واسألي الكاونسلر سما | ساما ويلنس ثيرابي",
  description: "اعرف إجابات الأسئلة الشائعة عن العلاج النفسي واسألي الكاونسلر سما مباشرة. تعرف على عملية التقييم والسرية وإيه اللي تتوقعه في ساما ويلنس ثيرابي.",
  alternates: {
    canonical: "/ar/ask",
    languages: { ar: "/ar/ask", en: "/ask" },
  },
  openGraph: {
    title: "الأسئلة الشائعة واسألي الكاونسلر سما | ساما ويلنس ثيرابي",
    description: "اعرف إجابات الأسئلة الشائعة عن العلاج النفسي واسألي الكاونسلر سما مباشرة في ساما ويلنس ثيرابي.",
    url: "https://www.samawellnesstherapy.com/ar/ask",
  },
};
import AskSamaGalleryIntroAr from "@/components/ar/AskSamaGalleryIntroAr";
import FAQAccordionAr from "@/components/ar/FAQAccordionAr";
import AskCounselorSamaAr from "@/components/ar/AskCounselorSamaAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

export default function AskPageAr() {
  return (
    <>
      <PageHeroAr eyebrow="احصل على إجابات" title="أسئلتك، مُجابة" />
      <ScrollReveal>
        <AskSamaGalleryIntroAr />
      </ScrollReveal>
      <ScrollReveal>
        <FAQAccordionAr />
      </ScrollReveal>
      <ScrollReveal>
        <AskCounselorSamaAr />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTAAr />
      </ScrollReveal>
    </>
  );
}
