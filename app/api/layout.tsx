import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import RootHtmlShell from "@/components/RootHtmlShell";

// app/api/ is almost entirely route.ts handlers (no layout needed there), but
// app/api/admin/test/page.tsx is a stray internal UI page living under this
// folder — so this top-level segment still needs its own root layout now that
// the shared app/layout.tsx is gone (split up so /ar/* can get its own
// lang="ar" root layout). Route handlers are unaffected by this file.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.samawellnesstherapy.com"),
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ApiLayout({ children }: { children: ReactNode }) {
  return (
    <RootHtmlShell lang="en">
      {children}
    </RootHtmlShell>
  );
}
