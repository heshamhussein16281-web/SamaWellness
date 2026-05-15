import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sama Wellness Therapy",
  description:
    "Professional mental wellness care tailored to your journey. Individual, Couple & Group Therapy in Cairo.",
  openGraph: {
    title: "Sama Wellness Therapy",
    description: "Elevate Your Mental Wellness",
    url: "https://www.samawellnesstherapy.com",
    siteName: "Sama Wellness Therapy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-body text-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
