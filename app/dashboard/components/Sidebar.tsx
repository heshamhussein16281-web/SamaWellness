'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">S</div>
        <span className="sidebar-logo-text">SWT Clinic</span>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Admin Section */}
      <div>
        <div className="sidebar-section-label">Admin</div>

        <Link href="/app/dashboard/admin/users">
          <div className={`sidebar-nav-item ${isActive('/app/dashboard/admin/users') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/app/dashboard/admin/users') ? 'active' : ''}`}>
              👥 Users
            </span>
          </div>
        </Link>

        <Link href="/app/dashboard/admin/roles">
          <div className={`sidebar-nav-item ${isActive('/app/dashboard/admin/roles') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/app/dashboard/admin/roles') ? 'active' : ''}`}>
              🔐 Roles
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
