/* صفحة الغرف — Arabic Rooms Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "غرف العلاج — سيرينيتي وهورايزون | ساما ويلنس ثيرابي",
  description: "اكتشف غرف العلاج في ساما ويلنس ثيرابي — سيرينيتي وهورايزون — مساحات مصممة للهدوء والتعافي في نيو جيزة، القاهرة.",
  alternates: {
    canonical: "/ar/rooms",
    languages: { ar: "/ar/rooms", en: "/rooms" },
  },
  openGraph: {
    title: "غرف العلاج — سيرينيتي وهورايزون | ساما ويلنس ثيرابي",
    description: "اكتشف غرف العلاج في ساما ويلنس ثيرابي — مساحات مصممة للهدوء والتعافي في نيو جيزة، القاهرة.",
    url: "https://www.samawellnesstherapy.com/ar/rooms",
  },
};
import RoomsGalleryIntroAr from "@/components/ar/RoomsGalleryIntroAr";
import RoomsEditorialAr from "@/components/ar/RoomsEditorialAr";
import RoomsValuesAr from "@/components/ar/RoomsValuesAr";
import TestimonialsRoomsAr from "@/components/ar/TestimonialsRoomsAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

export default function RoomsPageAr() {
  return (
    <>
      <PageHeroAr eyebrow="مساحاتنا" title="غرف العلاج" />
      <ScrollReveal>
        <RoomsGalleryIntroAr />
      </ScrollReveal>
      <ScrollReveal>
        <RoomsEditorialAr />
      </ScrollReveal>
      <ScrollReveal>
        <RoomsValuesAr />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsRoomsAr />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTAAr />
      </ScrollReveal>
    </>
  );
}
