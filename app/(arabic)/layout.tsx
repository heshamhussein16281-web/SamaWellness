import RootHtmlShell from "@/components/RootHtmlShell";

// Root layout for the entire Arabic route group. This is what makes the
// server-rendered <html> tag correctly say lang="ar" dir="rtl" for every /ar/*
// page (view-source / non-JS crawlers now see it directly, not just after
// components/ar/HtmlLangAr.tsx's client-side fix runs post-hydration).
export default function ArabicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootHtmlShell lang="ar" dir="rtl">
      {children}
    </RootHtmlShell>
  );
}
