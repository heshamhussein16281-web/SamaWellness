'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const sidebarStyle: React.CSSProperties = {
    width: '220px',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid rgb(234, 228, 221)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '30px',
  };

  const logoMarkStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    backgroundColor: '#7b2d3e',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
  };

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgb(234, 228, 221)',
    marginBottom: '20px',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgb(45, 74, 70)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '15px',
    opacity: 0.7,
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 10px',
    borderRadius: '4px',
    backgroundColor: active ? 'rgba(123, 45, 62, 0.08)' : 'transparent',
    borderLeft: active ? '3px solid #7b2d3e' : '3px solid transparent',
    paddingLeft: active ? '7px' : '10px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
  });

  const navLinkTextStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '12px',
    color: active ? 'rgb(45, 74, 70)' : 'rgb(45, 74, 70)',
    fontWeight: active ? '600' : '400',
    textDecoration: 'none',
  });

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={logoStyle}>
        <div style={logoMarkStyle}>S</div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgb(45, 74, 70)' }}>
          SWT Clinic
        </span>
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Admin Section */}
      <div>
        <div style={sectionLabelStyle}>Admin</div>

        <Link href="/app/dashboard/admin/users">
          <div style={navItemStyle(isActive('/app/dashboard/admin/users'))}>
            <span style={navLinkTextStyle(isActive('/app/dashboard/admin/users'))}>
              👥 Users
            </span>
          </div>
        </Link>

        <Link href="/app/dashboard/admin/roles">
          <div style={navItemStyle(isActive('/app/dashboard/admin/roles'))}>
            <span style={navLinkTextStyle(isActive('/app/dashboard/admin/roles'))}>
              🔐 Roles
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
