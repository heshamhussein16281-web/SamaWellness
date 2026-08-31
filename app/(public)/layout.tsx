import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Therapy & Counseling in New Giza, Cairo | Sama Wellness Therapy",
  description: "Individual, couples & group therapy in New Giza, Cairo. Licensed therapists matched to your needs. Book a free 15-min assessment with Sama Wellness Therapy.",
  other: {
    'facebook-domain-verification': 'bq5lk7pmejyijqs9tvokifgdhf9u2c',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
