/* صفحة الفريق — Arabic Team Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "تعرف على الفريق — ٨ معالجين مرخصين | ساما ويلنس ثيرابي",
  description: "تعرف على فريق المعالجين المرخصين في ساما ويلنس ثيرابي بنيو جيزة، القاهرة. بقيادة الكاونسلر سما عيسى، كل معالج بيتم اختياره شخصياً حسب احتياجاتك.",
  alternates: {
    canonical: "/ar/team",
    languages: { ar: "/ar/team", en: "/team" },
  },
  openGraph: {
    title: "تعرف على الفريق — ٨ معالجين مرخصين | ساما ويلنس ثيرابي",
    description: "تعرف على فريق المعالجين المرخصين في ساما ويلنس ثيرابي بنيو جيزة، القاهرة.",
    url: "https://www.samawellnesstherapy.com/ar/team",
  },
};
import TeamIntroSplitAr from "@/components/ar/TeamIntroSplitAr";
import TeamAr from "@/components/ar/TeamAr";
import TeamApproachAr from "@/components/ar/TeamApproachAr";
import TestimonialsTeamAr from "@/components/ar/TestimonialsTeamAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

export default function TeamPageAr() {
  return (
    <>
      <PageHeroAr eyebrow="معالجيك" title="تعرف على الفريق" />
      <ScrollReveal>
        <TeamIntroSplitAr />
      </ScrollReveal>
      <ScrollReveal>
        <TeamAr />
      </ScrollReveal>
      <ScrollReveal>
        <TeamApproachAr />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsTeamAr />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTAAr />
      </ScrollReveal>
    </>
  );
}
