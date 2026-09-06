import { Metadata } from "next";

export const metadata: Metadata = {
  title: "مدونة الصحة النفسية | سما ويلنس ثيرابي، نيو جيزة",
  description:
    "رؤى من معالجين مرخصين حول العلاج النفسي، العلاقات، العناية بالذات، والإيمان والعافية. سما ويلنس ثيرابي في نيو جيزة والشيخ زايد، القاهرة.",
  alternates: {
    canonical: "/ar/blog",
    languages: {
      ar: "/ar/blog",
      en: "/blog",
    },
  },
  openGraph: {
    title: "مدونة الصحة النفسية | سما ويلنس ثيرابي",
    description:
      "رؤى من معالجين مرخصين حول العلاج النفسي، العلاقات، العناية بالذات، والإيمان والعافية.",
    url: "https://www.samawellnesstherapy.com/ar/blog",
    siteName: "سما ويلنس ثيرابي",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدونة الصحة النفسية | سما ويلنس ثيرابي",
    description:
      "رؤى من معالجين مرخصين حول العلاج النفسي والعلاقات والعناية بالذات.",
  },
};

export default function BlogLayoutAr({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
