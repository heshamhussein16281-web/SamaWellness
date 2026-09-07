import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}
