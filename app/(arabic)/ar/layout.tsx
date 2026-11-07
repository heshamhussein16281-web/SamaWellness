import type { Metadata } from "next";
import Script from "next/script";
import { Tajawal } from "next/font/google";
import NavbarAr from "@/components/ar/NavbarAr";
import FooterAr from "@/components/ar/FooterAr";
import ContactButtonAr from "@/components/ar/ContactButtonAr";
import HtmlLangAr from "@/components/ar/HtmlLangAr";

// Tajawal is the only font that's actually rendered (referenced directly via
// var(--font-tajawal) in Arabic components and globals.css RTL overrides). Scoped
// here, to the /ar route group only, so it's never downloaded/preloaded on English
// pages where it was previously dead weight.
//
// preload: false — next/font's default preload:true emits a <link rel="preload">
// for every weight x subset combination (4 weights x 2 subsets = 8 files), each
// treated as high-priority by the browser. Those 8 preloads were landing in <head>
// ahead of the hero room photo's own fetchPriority="high" preload, competing for
// the same early bandwidth on mobile and delaying the photo's actual paint enough
// to occasionally blow past PageSpeed Insights' capture window (observed as a
// reproducible NO_LCP lab result on /ar, not seen on / since Action 3 removed its
// fonts entirely). Disabling preload doesn't stop Tajawal from loading or rendering
// — display:"swap" already shows the fallback font immediately and swaps in Tajawal
// whenever each weight's file arrives, same as any non-preloaded webfont. It just
// stops those 8 requests from racing the hero image for priority at document start.
const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
  preload: false,
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
