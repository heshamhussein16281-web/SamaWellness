import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Gilda_Display, Nunito_Sans, Josefin_Sans, Tajawal } from "next/font/google";
import { QueryClientProviderWrapper } from "@/lib/providers";
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

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Therapist in New Giza, Cairo | Sama Wellness Therapy",
  description: "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists matched to your needs. Book a free 15-min assessment with Sama Wellness Therapy.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-P3BHRZTS');
            `,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Meta Pixel Code - ID: 2396440094165769 (Previous: 1548482433359434) */}
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
              fbq('init', '2396440094165769');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2396440094165769&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
      </head>
      <body className={`${gildaDisplay.variable} ${nunitoSans.variable} ${josefinSans.variable} ${tajawal.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P3BHRZTS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <QueryClientProviderWrapper>
          {children}
        </QueryClientProviderWrapper>

        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "y39zdh58zg");
            `,
          }}
        />
        {/* End Microsoft Clarity */}
      </body>
    </html>
  );
}
