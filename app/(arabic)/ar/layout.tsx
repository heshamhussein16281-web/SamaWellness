import type { Metadata } from "next";
import Script from "next/script";
import { Tajawal } from "next/font/google";
import NavbarAr from "@/components/ar/NavbarAr";
import FooterAr from "@/components/ar/FooterAr";
import ContactButtonAr from "@/components/ar/ContactButtonAr";
import HtmlLangAr from "@/components/ar/HtmlLangAr";
import SourceTagCapture from "@/components/SourceTagCapture";

// Tajawal is the only font that's actually rendered (referenced directly via
// var(--font-tajawal) in Arabic components and globals.css RTL overrides). Scoped
// here, to the /ar route group only, so it's never downloaded/preloaded on English
// pages where it was previously dead weight.
//
// subsets: ["arabic"] only (no "latin") — Arabic body copy doesn't need the Latin
// glyph set, and dropping it halves the file count (4 files instead of 8).
//
// preload: true (Action 11) — Action 2b (7 Nov) set preload:false because the
// default preload:true emitted 8 <link rel="preload"> tags (4 weights x 2 subsets)
// that raced the hero room photo's fetchPriority="high" preload for early bandwidth
// on mobile, occasionally causing NO_LCP. With the subset trimmed to 4 Arabic-only
// files, preload is back on: all 4 weights now arrive early instead of swapping in
// late (which was shifting values-strip/teaser-section/testimonials/final-cta by
// ~240px total as Tajawal landed below the fold — real-user CLS 0.41 on /ar). If a
// future Lighthouse run on /ar regresses to NO_LCP or LCP > 2.5s, revert this to
// preload:false and add min-height to the affected section text blocks instead.
const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "معالج نفسي في نيو جيزة، القاهرة | ساما ويلنس ثيرابي",
  description:
    "علاج فردي وزوجي وجماعي في نيو جيزة، القاهرة — حضورياً أو أونلاين في مصر والمملكة العربية السعودية. معالجين متخصصين يتم اختيارهم حسب احتياجاتك.",
  alternates: {
    canonical: "/ar",
    languages: {
      ar: "/ar",
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "معالج نفسي في نيو جيزة، القاهرة | ساما ويلنس ثيرابي",
    description:
      "علاج فردي وزوجي وجماعي في نيو جيزة، القاهرة. معالجين متخصصين يتم اختيارهم شخصياً بواسطة المديرة الإكلينيكية سما عيسى.",
    url: "https://www.samawellnesstherapy.com/ar",
    siteName: "سما ويلنس ثيرابي",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "https://www.samawellnesstherapy.com/room.jpg",
        width: 1200,
        height: 630,
        alt: "ساما ويلنس ثيرابي — غرفة العلاج في نيو جيزة، القاهرة",
      },
    ],
  },
};

const jsonLdAr = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Sama Wellness Therapy - ساما ويلنس ثيرابي",
  description:
    "علاج فردي وزوجي وجماعي في نيو جيزة، القاهرة. معالجين متخصصين يتم اختيارهم شخصياً بواسطة المديرة الإكلينيكية سما عيسى.",
  url: "https://www.samawellnesstherapy.com/ar",
  logo: "https://www.samawellnesstherapy.com/logo-hero.png",
  image: "https://www.samawellnesstherapy.com/room.jpg",
  telephone: "+201130946556",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ميدتاون - B1 - C031",
    addressLocality: "New Giza - نيو جيزة",
    addressRegion: "محافظة الجيزة",
    postalCode: "12588",
    addressCountry: "EG",
  },
  inLanguage: "ar",
  availableService: [
    { "@type": "MedicalTherapy", name: "العلاج الفردي" },
    { "@type": "MedicalTherapy", name: "العلاج الفردي (أونلاين)" },
    { "@type": "MedicalTherapy", name: "علاج الأزواج" },
    { "@type": "MedicalTherapy", name: "علاج الأزواج (أونلاين)" },
    { "@type": "MedicalTherapy", name: "العلاج الجماعي" },
    { "@type": "MedicalTherapy", name: "العلاج الجماعي (أونلاين)" },
  ],
  areaServed: [
    { "@type": "Country", name: "مصر" },
    { "@type": "Country", name: "المملكة العربية السعودية" },
  ],
  founder: {
    "@type": "Person",
    name: "Sama Eissa - سما عيسى",
    jobTitle: "المؤسسة والمديرة الإكلينيكية",
  },
};

export default function ArabicPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="ar" className={tajawal.variable}>
      <HtmlLangAr />
      <SourceTagCapture />
      <Script
        id="json-ld-ar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAr) }}
      />
      <NavbarAr />
      <main>{children}</main>
      <FooterAr />
      <ContactButtonAr />
    </div>
  );
}
