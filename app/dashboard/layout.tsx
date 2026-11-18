import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import DashboardLayout from './components/DashboardLayout';
import RootHtmlShell from '@/components/RootHtmlShell';

// Root layout for the staff dashboards (/dashboard/*). Previously relied on the
// single shared app/layout.tsx for <html>/<body>, scripts, and the React Query
// provider (used by e.g. PaymentVerificationModal) — now scoped here directly
// so this segment keeps behaving identically after the Arabic marketing site
// got its own lang="ar" root layout. DashboardLayout itself stays a Client
// Component ('use client' in ./components/DashboardLayout); this file itself
// doesn't need the directive.
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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootHtmlShell lang="en">
      <DashboardLayout>{children}</DashboardLayout>
    </RootHtmlShell>
  );
}
