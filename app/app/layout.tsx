'use client';

import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      {children}
      <style jsx global>{`
        .app-layout {
          min-height: 100vh;
          background: var(--color-linen);
        }
      `}</style>
    </div>
  );
}
