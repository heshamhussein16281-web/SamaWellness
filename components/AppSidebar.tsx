'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: '📊' },
  { label: 'Clients', href: '/app/clients', icon: '👥' },
  { label: 'Bookings', href: '/app/bookings', icon: '📅' },
  { label: 'Payments', href: '/app/payments', icon: '💳' },
  { label: 'Assessments', href: '/app/assessments', icon: '📝' },
  { label: 'Satisfaction', href: '/app/satisfaction', icon: '⭐' },
  { label: 'Reassignments', href: '/app/reassignments', icon: '🔄' },
  { label: 'Change Log', href: '/app/change-log', icon: '📋' },
  { label: 'Ended Calls', href: '/app/ended-calls', icon: '📞' },
  { label: 'Credit Balance', href: '/app/credits', icon: '💰' },
  { label: 'Payouts', href: '/app/payouts', icon: '🏦' },
  { label: 'Expenses', href: '/app/expenses', icon: '💸' },
  { label: 'Discharged', href: '/app/discharged', icon: '✅' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/app/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="sidebar-mobile-toggle"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">SWT Clinic</h2>
          <p className="sidebar-subtitle">Management System</p>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <style jsx>{`
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 999;
          width: 44px;
          height: 44px;
          background: var(--color-burgundy);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 24px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .sidebar-mobile-toggle {
            display: block;
          }
        }

        .app-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid var(--color-sand);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow-y: auto;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .app-sidebar {
            position: fixed;
            left: -280px;
            transition: left 0.3s ease;
            z-index: 200;
          }

          .app-sidebar.mobile-open {
            left: 0;
          }
        }

        .sidebar-header {
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--color-sand);
        }

        .sidebar-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-nav-text);
          margin: 0 0 4px 0;
        }

        .sidebar-subtitle {
          font-family: var(--font-body);
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--color-nav-text);
          transition: all 0.2s ease;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 14px;
        }

        .sidebar-link:hover {
          background: #f5f5f5;
        }

        .sidebar-link.active {
          background: var(--color-burgundy);
          color: white;
          font-weight: 600;
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 18px;
        }

        .sidebar-label {
          flex: 1;
        }

        .sidebar-footer {
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-sand);
        }

        .sidebar-logout {
          width: 100%;
          padding: 10px 12px;
          background: #f5f5f5;
          border: 1px solid var(--color-sand);
          border-radius: 6px;
          color: var(--color-nav-text);
          font-family: var(--font-body);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-logout:hover {
          background: var(--color-sand);
          border-color: var(--color-burgundy);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
        }

        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
