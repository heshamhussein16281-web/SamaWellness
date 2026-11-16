import Script from "next/script";
import { QueryClientProviderWrapper } from "@/lib/providers";
import "@/app/globals.css";

// Shared <html>/<body> scaffold used by every top-level root layout in the app
// (public marketing site, Arabic marketing site, clinic app, dashboards, preview
// sandbox). Next.js only allows ONE <html> tag per rendered route, owned by
// whichever layout is the "root" for that top-level segment — so to give the
// Arabic routes a server-rendered lang="ar" dir="rtl" (instead of the old
// client-side-only fix in HtmlLangAr.tsx), every top-level segment needs its own
// root layout. This component centralizes the part that must stay byte-for-byte
// identical across all of them (tracking scripts, React Query provider, global
// CSS) so only the `lang`/`dir` actually varies between callers.
export default function RootHtmlShell({
  lang,
  dir,
  children,
}: {
  lang: "en" | "ar";
  dir?: "rtl";
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir}>
      <head>
        {/* Google Tag Manager — skip on /preview/ and /dashboard/ */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if(window.location.hostname==='www.samawellnesstherapy.com'&&!/^\\/(preview|dashboard)/.test(window.location.pathname)){
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-P3BHRZTS');
              }
            `,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
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

        {/* Microsoft Clarity — skip on /preview/ and /dashboard/ */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if(window.location.hostname==='www.samawellnesstherapy.com'&&!/^\\/(preview|dashboard)/.test(window.location.pathname)){
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "y39zdh58zg");
              }
            `,
          }}
        />
        {/* End Microsoft Clarity */}
      </body>
    </html>
  );
}
