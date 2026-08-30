import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sama Wellness Therapy",
  description: "Founded by Sama Eissa, Clinical Director & Licensed Therapist. Professional individual, couples, and group therapy at our New Giza clinic. Expert matching to the right therapist for your journey.",
  other: {
    'facebook-domain-verification': 'bq5lk7pmejyijqs9tvokifgdhf9u2c',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
