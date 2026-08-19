import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sama Wellness Therapy",
  description: "Professional psychological support services",
  other: {
    'facebook-domain-verification': 'bq5lk7pmejyijqs9tvokifgdhf9u2c',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
