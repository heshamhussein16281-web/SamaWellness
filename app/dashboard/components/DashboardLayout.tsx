'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <Topbar />

        {/* Content Area */}
        <main style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#F5F2EE' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
