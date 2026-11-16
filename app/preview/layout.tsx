import type { Metadata, Viewport } from "next";
import RootHtmlShell from "@/components/RootHtmlShell";

// Root layout for the internal preview sandbox (/preview/*). Previously relied
// on the single shared app/layout.tsx for <html>/<body> and scripts — now
// scoped here directly so this segment keeps behaving identically after the
// Arabic marketing site got its own lang="ar" root layout.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.samawellnesstherapy.com"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootHtmlShell lang="en">
      {/* Internal-only banner */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: "#7b2d3e",
          color: "#fff",
          textAlign: "center",
          padding: "8px 16px",
          fontSize: "13px",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        INTERNAL PREVIEW — NOT A PUBLIC PAGE
      </div>
      <div style={{ paddingTop: "36px" }}>{children}</div>
    </RootHtmlShell>
  );
}
