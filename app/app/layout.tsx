import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import RootHtmlShell from '@/components/RootHtmlShell';

// Root layout for the clinic app (/app/*). Previously relied on the single
// shared app/layout.tsx for <html>/<body>, scripts, and metadata — now that the
// Arabic marketing site needs its own lang="ar" root layout, every top-level
// segment needs its own root. This preserves the exact same behavior this
// segment had before (same metadata defaults, same tracking scripts via
// RootHtmlShell), just scoped to this segment instead of inherited.
export const metadata: Metadata = {
  metadataBase: new URL('https://www.samawellnesstherapy.com'),
  title: 'Therapist in New Giza, near Sheikh Zayed, Cairo | Sama Wellness Therapy',
  description:
    'Individual, couples & group therapy in New Giza, near Sheikh Zayed, Cairo. Licensed therapists matched to your needs. Book a free assessment.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RootHtmlShell lang="en">
      {children}
    </RootHtmlShell>
  );
}
