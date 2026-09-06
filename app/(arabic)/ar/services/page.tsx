/* صفحة الخدمات — Arabic Services Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "خدماتنا — علاج فردي، زوجي وجماعي | ساما ويلنس ثيرابي",
  description: "اكتشف خدمات العلاج الفردي والزوجي والجماعي في ساما ويلنس ثيرابي بنيو جيزة، القاهرة. كل عميل بيتم اختيار المعالج المناسب ليه من خلال تقييم مجاني.",
  alternates: {
    canonical: "/ar/services",
    languages: { ar: "/ar/services", en: "/services" },
  },
  openGraph: {
    title: "خدماتنا — علاج فردي، زوجي وجماعي | ساما ويلنس ثيرابي",
    description: "اكتشف خدمات العلاج الفردي والزوجي والجماعي في ساما ويلنس ثيرابي بنيو جيزة، القاهرة.",
    url: "https://www.samawellnesstherapy.com/ar/services",
  },
};
import ServicesIntroSplitAr from "@/components/ar/ServicesIntroSplitAr";
import ServicesAr from "@/components/ar/ServicesAr";
import ProcessAr from "@/components/ar/ProcessAr";
import WhoIsThisForGridAr from "@/components/ar/WhoIsThisForGridAr";
import TestimonialsServicesAr from "@/components/ar/TestimonialsServicesAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

export default function ServicesPageAr() {
  return (
    <>
      <PageHeroAr eyebrow="ما نقدمه" title="خدماتنا" />
      <ScrollReveal>
        <ServicesIntroSplitAr />
      </ScrollReveal>
      <ScrollReveal>
        <ServicesAr />
      </ScrollReveal>
      <ScrollReveal>
        <ProcessAr />
      </ScrollReveal>
      <ScrollReveal>
        <WhoIsThisForGridAr />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsServicesAr />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTAAr />
      </ScrollReveal>
    </>
  );
}
