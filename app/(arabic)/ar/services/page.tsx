/* صفحة الخدمات — Arabic Services Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "خدماتنا — علاج فردي، زوجي وجماعي، حضورياً وأونلاين | ساما ويلنس ثيرابي",
  description: "علاج فردي وزوجي وجماعي في عيادتنا بنيو جيزة أو أونلاين في مصر والسعودية. كل عميل بيتم اختيار المعالج المناسب ليه من خلال تقييم مجاني.",
  alternates: {
    canonical: "/ar/services",
    languages: { ar: "/ar/services", en: "/services", "x-default": "/services" },
  },
  openGraph: {
    title: "خدماتنا — علاج فردي، زوجي وجماعي، حضورياً وأونلاين | ساما ويلنس ثيرابي",
    description: "علاج فردي وزوجي وجماعي في عيادتنا بنيو جيزة أو أونلاين في مصر والسعودية. كل عميل بيتم اختيار المعالج المناسب ليه من خلال تقييم مجاني.",
    url: "https://www.samawellnesstherapy.com/ar/services",
  },
};
import ServicesIntroSplitAr from "@/components/ar/ServicesIntroSplitAr";
import ServicesAr from "@/components/ar/ServicesAr";
import ProcessAr from "@/components/ar/ProcessAr";
import WhoIsThisForGridAr from "@/components/ar/WhoIsThisForGridAr";
import TestimonialsServicesAr from "@/components/ar/TestimonialsServicesAr";
import MidCTAAr from "@/components/ar/MidCTAAr";
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
      <MidCTAAr />
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
