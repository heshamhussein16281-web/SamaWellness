import type { Metadata } from "next";
import Script from "next/script";
import NavbarAr from "@/components/ar/NavbarAr";
import FooterAr from "@/components/ar/FooterAr";
import ContactButtonAr from "@/components/ar/ContactButtonAr";
import HtmlLangAr from "@/components/ar/HtmlLangAr";

export const metadata: Metadata = {
  title: "معالج نفسي في نيو جيزة، القاهرة | ساما ويلنس ثيرابي",
  description:
    "علاج فردي وزوجي وجماعي في نيو جيزة، القاهرة. معالجين متخصصين يتم اختيارهم حسب احتياجاتك. احجز تقييم مجاني ١٥ دقيقة مع ساما ويلنس ثيرابي.",
  alternates: {
    canonical: "/ar",
    languages: {
      ar: "/ar",
      en: "/",
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
    addressLocality: "New Giza - نيو جيزة",
    addressRegion: "القاهرة",
    addressCountry: "EG",
  },
  inLanguage: "ar",
  availableService: [
    { "@type": "MedicalTherapy", name: "العلاج الفردي" },
    { "@type": "MedicalTherapy", name: "العلاج الزوجي" },
    { "@type": "MedicalTherapy", name: "العلاج الجماعي" },
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
    <div dir="rtl" lang="ar">
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
