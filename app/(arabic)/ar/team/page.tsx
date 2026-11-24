/* صفحة الفريق — Arabic Team Page
   Navbar + Footer + ContactButton provided by ar/layout.tsx */
import type { Metadata } from "next";
import Script from "next/script";
import PageHeroAr from "@/components/ar/PageHeroAr";
import ScrollReveal from "@/components/ScrollReveal";
import { therapistsAr } from "@/lib/team-data-ar";

export const metadata: Metadata = {
  title: "فريق معالجين نفسيين مرخصين في نيو جيزة وأونلاين | Sama",
  description: "تعرّف على فريق معالجين مرخصين في نيو جيزة، قريب من الشيخ زايد و٦ أكتوبر. علاج فردي وزوجي، وتقييم مجاني ١٥ دقيقة بنختارلك فيه المعالج المناسب.",
  alternates: {
    canonical: "/ar/team",
    languages: { ar: "/ar/team", en: "/team", "x-default": "/team" },
  },
  openGraph: {
    title: "فريق معالجين نفسيين مرخصين في نيو جيزة وأونلاين | Sama",
    description: "تعرّف على فريق معالجين مرخصين في نيو جيزة، قريب من الشيخ زايد و٦ أكتوبر. علاج فردي وزوجي، وتقييم مجاني ١٥ دقيقة بنختارلك فيه المعالج المناسب.",
    url: "https://www.samawellnesstherapy.com/ar/team",
  },
};
import TeamIntroSplitAr from "@/components/ar/TeamIntroSplitAr";
import TeamAr from "@/components/ar/TeamAr";
import TeamApproachAr from "@/components/ar/TeamApproachAr";
import TestimonialsTeamAr from "@/components/ar/TestimonialsTeamAr";
import MidCTAAr from "@/components/ar/MidCTAAr";
import FinalCTAAr from "@/components/ar/FinalCTAAr";

const teamJsonLdAr = {
  "@context": "https://schema.org",
  "@graph": therapistsAr.map((t) => ({
    "@type": "Person",
    name: t.name,
    jobTitle: t.title,
    description: t.approach,
    image: `https://www.samawellnesstherapy.com${t.image}`,
    worksFor: {
      "@type": "MedicalBusiness",
      name: "Sama Wellness Therapy - سما ويلنس ثيرابي",
      url: "https://www.samawellnesstherapy.com/ar",
    },
  })),
};

export default function TeamPageAr() {
  return (
    <>
      <Script
        id="team-json-ld-ar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLdAr) }}
      />
      <PageHeroAr eyebrow="معالجيك" title="تعرف على الفريق" />
      <ScrollReveal>
        <TeamIntroSplitAr />
      </ScrollReveal>
      <ScrollReveal>
        <TeamAr />
      </ScrollReveal>
      <MidCTAAr />
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
