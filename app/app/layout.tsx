'use client';

import { ReactNode } from 'react';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-container">
      <AppSidebar />
      <main className="app-main">{children}</main>
      <style jsx global>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--color-linen);
        }

        .app-main {
          flex: 1;
          margin-left: 280px;
          padding: var(--space-lg);
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .app-main {
            margin-left: 0;
            padding-top: 80px;
          }
        }
      `}</style>
    </div>
  );
}
