import type { Metadata } from "next";
import { Gilda_Display, Nunito_Sans, Josefin_Sans } from "next/font/google";
import "./globals.css";

const gildaDisplay = Gilda_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-gilda",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sama Wellness Therapy",
  description: "Professional Care Tailored to Your Journey",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${gildaDisplay.variable} ${nunitoSans.variable} ${josefinSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
