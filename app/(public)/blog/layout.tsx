import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mental Health Blog | Sama Wellness Therapy, New Giza",
  description:
    "Expert insights on therapy, relationships, self-care, and faith from licensed therapists at Sama Wellness Therapy in New Giza & Sheikh Zayed, Cairo.",
  alternates: {
    canonical: "/blog",
    languages: {
      en: "/blog",
      ar: "/ar/blog",
    },
  },
  openGraph: {
    title: "Mental Health Blog | Sama Wellness Therapy",
    description:
      "Expert insights on therapy, relationships, self-care, and faith from licensed therapists in New Giza & Sheikh Zayed.",
    url: "https://www.samawellnesstherapy.com/blog",
    siteName: "Sama Wellness Therapy",
    locale: "en_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mental Health Blog | Sama Wellness Therapy",
    description:
      "Expert insights on therapy, relationships, self-care, and faith from licensed therapists in New Giza.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
