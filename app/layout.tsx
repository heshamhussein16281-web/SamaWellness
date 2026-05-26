import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1548482433359434');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1548482433359434&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
      </head>
      <body className={`${gildaDisplay.variable} ${nunitoSans.variable} ${josefinSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
