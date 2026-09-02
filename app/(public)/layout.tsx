import type { Metadata } from "next";
import Script from "next/script";
import NavbarMultiPage from "@/components/NavbarMultiPage";
import Footer from "@/components/Footer";
import ContactButton from "@/components/ContactButton";

export const metadata: Metadata = {
  title: "Therapist in New Giza, Cairo | Sama Wellness Therapy",
  description: "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists matched to your needs. Book a free 15-min assessment with Sama Wellness Therapy.",
  openGraph: {
    title: "Therapist in New Giza, Cairo | Sama Wellness Therapy",
    description: "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists personally matched to your needs by Clinical Director Sama Eissa.",
    url: "https://samawellnesstherapy.com",
    siteName: "Sama Wellness Therapy",
    locale: "en_EG",
    type: "website",
    images: [
      {
        url: "https://samawellnesstherapy.com/room.jpg",
        width: 1200,
        height: 630,
        alt: "Sama Wellness Therapy — therapy room in New Giza, Cairo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Therapist in New Giza, Cairo | Sama Wellness Therapy",
    description: "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists personally matched to your needs.",
    images: ["https://samawellnesstherapy.com/room.jpg"],
  },
  other: {
    'facebook-domain-verification': 'bq5lk7pmejyijqs9tvokifgdhf9u2c',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Sama Wellness Therapy",
  "description": "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists personally matched to your needs by Clinical Director Sama Eissa.",
  "url": "https://samawellnesstherapy.com",
  "logo": "https://samawellnesstherapy.com/logo-hero.png",
  "image": "https://samawellnesstherapy.com/room.jpg",
  "telephone": "+201130946556",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "New Giza",
    "addressRegion": "Cairo",
    "addressCountry": "EG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 29.9792,
    "longitude": 31.0961
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
    "opens": "09:00",
    "closes": "21:00"
  },
  "medicalSpecialty": [
    "Psychiatry",
    "CounselingPsychology"
  ],
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Individual Therapy" },
    { "@type": "MedicalTherapy", "name": "Couples Therapy" },
    { "@type": "MedicalTherapy", "name": "Group Therapy" }
  ],
  "founder": {
    "@type": "Person",
    "name": "Sama Eissa",
    "jobTitle": "Clinical Director"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 8
  },
  "priceRange": "$$"
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavbarMultiPage />
      <main>{children}</main>
      <Footer />
      <ContactButton />
    </>
  );
}
