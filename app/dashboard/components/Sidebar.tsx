'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Permission mapping: each link requires at least one of these permissions
// These keys must match the permission 'key' values in the Supabase 'permissions' table
const linkPermissions = {
  clients: ['view_clients', 'manage_clients'],
  bookings: ['view_bookings', 'manage_bookings'],
  therapists: ['view_therapists', 'manage_therapists'],
  clinics: ['manage_clinics'],
  users: ['manage_users'],
  roles: ['manage_roles'],
  auditLogs: ['is_super_admin'],
};

// Helper function to check if user has permission for a link
const hasPermission = (permissions: string[] | undefined, requiredPerms: string[]): boolean => {
  if (!permissions) return false;
  return requiredPerms.some(p => permissions.includes(p));
};

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

  // Calculate visible links for each section
  const visibleClinicalLinks = [
    user && hasPermission(user.permissions, linkPermissions.clients),
    user && hasPermission(user.permissions, linkPermissions.bookings),
    user && hasPermission(user.permissions, linkPermissions.therapists),
  ].some(Boolean);

  const visibleAdminLinks = [
    user && hasPermission(user.permissions, linkPermissions.clinics),
    user && hasPermission(user.permissions, linkPermissions.users),
    user && hasPermission(user.permissions, linkPermissions.roles),
    isSuperAdmin, // Audit Logs visibility
  ].some(Boolean);

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">S</div>
        <span className="sidebar-logo-text">SWT Clinic</span>
      </div>

      {/* Clinical Section */}
      {visibleClinicalLinks && (
        <>
          <div className="sidebar-divider" />
          <div className={`sidebar-section ${isClinicalSection ? 'sidebar-section-active' : ''}`}>
        <div className="sidebar-section-label">Clinical</div>

        {user && hasPermission(user.permissions, linkPermissions.clients) && (
          <Link href="/dashboard/clinical/clients" className={`sidebar-nav-link ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-label">Clients</span>
            </div>
          </Link>
        )}

        {user && hasPermission(user.permissions, linkPermissions.bookings) && (
          <Link href="/dashboard/clinical/bookings" className={`sidebar-nav-link ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
              <span className="sidebar-icon">📅</span>
              <span className="sidebar-label">Bookings</span>
            </div>
          </Link>
        )}

        {user && hasPermission(user.permissions, linkPermissions.therapists) && (
          <Link href="/dashboard/clinical/therapists" className={`sidebar-nav-link ${isActive('/dashboard/clinical/therapists') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/therapists') ? 'active' : ''}`}>
              <span className="sidebar-icon">💼</span>
              <span className="sidebar-label">Therapists</span>
            </div>
          </Link>
        )}
          </div>
        </>
      )}

      {/* Admin Section */}
      {visibleAdminLinks && (
        <>
          <div className="sidebar-divider" />
          <div className={`sidebar-section ${isAdminSection ? 'sidebar-section-active' : ''}`}>
        <div className="sidebar-section-label">Admin</div>

        {user && hasPermission(user.permissions, linkPermissions.clinics) && (
          <Link href="/dashboard/admin/clinics" className={`sidebar-nav-link ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
              <span className="sidebar-icon">🏥</span>
              <span className="sidebar-label">Clinics</span>
            </div>
          </Link>
        )}

        {user && hasPermission(user.permissions, linkPermissions.users) && (
          <Link href="/dashboard/admin/users" className={`sidebar-nav-link ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
              <span className="sidebar-icon">👥</span>
              <span className="sidebar-label">Users</span>
            </div>
          </Link>
        )}

        {user && hasPermission(user.permissions, linkPermissions.roles) && (
          <Link href="/dashboard/admin/roles" className={`sidebar-nav-link ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
              <span className="sidebar-icon">🔐</span>
              <span className="sidebar-label">Roles</span>
            </div>
          </Link>
        )}

        {!loading && isSuperAdmin && (
          <Link href="/dashboard/admin/audit-logs" className={`sidebar-nav-link ${isActive('/dashboard/admin/audit-logs') ? 'active' : ''}`}>
            <div className={`sidebar-nav-item ${isActive('/dashboard/admin/audit-logs') ? 'active' : ''}`}>
              <span className="sidebar-icon">📋</span>
              <span className="sidebar-label">Audit Logs</span>
            </div>
          </Link>
        )}
          </div>
        </>
      )}
    </aside>
  );
}
