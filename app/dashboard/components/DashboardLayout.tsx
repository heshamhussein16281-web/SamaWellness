'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../dashboard.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-content-wrapper">
        {/* Topbar */}
        <Topbar />

        {/* Content Area */}
        <main className="dashboard-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
