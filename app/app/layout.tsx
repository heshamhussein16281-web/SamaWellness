import { ReactNode } from 'react';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <main style={{ flex: 1, marginLeft: '280px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
