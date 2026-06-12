'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UserData {
  role: string;
  permissions: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (href: string) => pathname === href;

  const isClinicalSection = pathname.includes('/dashboard/clinical');
  const isAdminSection = pathname.includes('/dashboard/admin');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isSuperAdmin = user && (user.role === 'Super Admin' || user.permissions?.includes('is_super_admin'));

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">S</div>
        <span className="sidebar-logo-text">SWT Clinic</span>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Clinical Section */}
      <div className={`sidebar-section ${isClinicalSection ? 'sidebar-section-active' : ''}`}>
        <div className="sidebar-section-label">Clinical</div>

        <Link href="/dashboard/clinical/clients">
          <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
              👤 Clients
            </span>
          </div>
        </Link>

        <Link href="/dashboard/clinical/bookings">
          <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
              📅 Bookings
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Admin Section */}
      <div className={`sidebar-section ${isAdminSection ? 'sidebar-section-active' : ''}`}>
        <div className="sidebar-section-label">Admin</div>

        <Link href="/dashboard/admin/users">
          <div className={`sidebar-nav-item ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
              👥 Users
            </span>
          </div>
        </Link>

        <Link href="/dashboard/admin/roles">
          <div className={`sidebar-nav-item ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
            <span className={`sidebar-nav-link ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
              🔐 Roles
            </span>
          </div>
        </Link>

        {!loading && isSuperAdmin && (
          <Link href="/dashboard/admin/audit-logs">
            <div className={`sidebar-nav-item ${isActive('/dashboard/admin/audit-logs') ? 'active' : ''}`}>
              <span className={`sidebar-nav-link ${isActive('/dashboard/admin/audit-logs') ? 'active' : ''}`}>
                📋 Audit Logs
              </span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
