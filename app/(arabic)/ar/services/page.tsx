/* صفحة الخدمات — Arabic Services Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "خدمات علاج نفسي واستشارات زوجية في نيو جيزة وأونلاين | Sama",
  description: "علاج فردي وزوجي وجماعي واستشارات زوجية في عيادتنا بنيو جيزة، قريبة من الشيخ زايد و٦ أكتوبر، وأونلاين لخارج الجيزة والسعودية. احجز تقييم مجاني ١٥ دقيقة.",
  alternates: {
    canonical: "/ar/services",
    languages: { ar: "/ar/services", en: "/services", "x-default": "/services" },
  },
  openGraph: {
    title: "خدمات علاج نفسي واستشارات زوجية في نيو جيزة وأونلاين | Sama",
    description: "علاج فردي وزوجي وجماعي واستشارات زوجية في عيادتنا بنيو جيزة، قريبة من الشيخ زايد و٦ أكتوبر، وأونلاين لخارج الجيزة والسعودية. احجز تقييم مجاني ١٥ دقيقة.",
    url: "https://www.samawellnesstherapy.com/ar/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "خدمات علاج نفسي واستشارات زوجية في نيو جيزة وأونلاين | Sama",
    description: "علاج فردي وزوجي وجماعي واستشارات زوجية في عيادتنا بنيو جيزة، قريبة من الشيخ زايد و٦ أكتوبر، وأونلاين لخارج الجيزة والسعودية. احجز تقييم مجاني ١٥ دقيقة.",
  },
};
import ServicesIntroSplitAr from "@/components/ar/ServicesIntroSplitAr";
import ServicesAr from "@/components/ar/ServicesAr";
import WhatWeTreatAr from "@/components/ar/WhatWeTreatAr";
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
      <ScrollReveal>
        <WhatWeTreatAr />
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
