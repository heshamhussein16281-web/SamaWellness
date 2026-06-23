'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: '📊', permission: null },
  { label: 'Clients', href: '/app/clients', icon: '👥', permission: 'view_clients' },
  { label: 'Bookings', href: '/app/bookings', icon: '📅', permission: 'view_bookings' },
  { label: 'Payments', href: '/app/payments', icon: '💳', permission: 'view_payments' },
  { label: 'Assessments', href: '/app/assessments', icon: '📝', permission: 'view_assessments' },
  { label: 'Satisfaction', href: '/app/satisfaction', icon: '⭐', permission: 'view_satisfaction' },
  { label: 'Reassignments', href: '/app/reassignments', icon: '🔄', permission: 'view_clients' },
  { label: 'Change Log', href: '/app/change-log', icon: '📋', permission: 'view_change_log' },
  { label: 'Ended Calls', href: '/app/ended-calls', icon: '📞', permission: 'view_bookings' },
  { label: 'Credit Balance', href: '/app/credits', icon: '💰', permission: 'view_clients' },
  { label: 'Payouts', href: '/app/payouts', icon: '🏦', permission: 'view_payouts' },
  { label: 'Expenses', href: '/app/expenses', icon: '💸', permission: 'view_expenses' },
  { label: 'Discharged', href: '/app/discharged', icon: '✅', permission: 'view_clients' },
];

const ADMIN_ITEMS = [
  { label: 'Users', href: '/app/admin/users', icon: '👤', permission: 'manage_users' },
  { label: 'Roles', href: '/app/admin/roles', icon: '⚙️', permission: 'manage_roles' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/auth/verify');
        if (res.ok) {
          const data = await res.json();
          setPermissions(data.permissions || []);
          setUserName(data.username || '');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const filteredMenuItems = MENU_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const filteredAdminItems = ADMIN_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/app/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
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
          {userName && <p className="sidebar-user">👤 {userName}</p>}
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
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

          {/* Admin Section */}
          {filteredAdminItems.length > 0 && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-section-title">Administration</div>
              {filteredAdminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link admin-link ${
                    pathname === item.href ? 'active' : ''
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogoutClick} className="sidebar-logout">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <>
          <div className="logout-dialog-overlay" onClick={handleCancelLogout} />
          <div className="logout-dialog">
            <div className="logout-dialog__header">
              <h3 className="logout-dialog__title">Confirm Logout</h3>
              <button
                onClick={handleCancelLogout}
                className="logout-dialog__close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="logout-dialog__content">
              <p className="logout-dialog__message">
                Are you sure you want to logout? You will need to log in again to access the system.
              </p>
            </div>
            <div className="logout-dialog__actions">
              <button
                onClick={handleCancelLogout}
                className="logout-dialog__button logout-dialog__button--cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="logout-dialog__button logout-dialog__button--confirm"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

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
          overscroll-behavior: contain;
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

        .sidebar-user {
          font-family: var(--font-body);
          font-size: 11px;
          color: #999;
          margin: 8px 0 0 0;
          padding-top: 8px;
          border-top: 1px solid var(--color-sand);
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

        .sidebar-link.admin-link {
          background: #fafafa;
        }

        .sidebar-link.admin-link:hover {
          background: #f0f0f0;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--color-sand);
          margin: 8px 0;
        }

        .sidebar-section-title {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          padding: 8px 12px;
          letter-spacing: 0.5px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 14px;
          background: linear-gradient(135deg, #7b2d3e 0%, #5a1f2e 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(123, 45, 62, 0.2);
        }

        .sidebar-logout:hover {
          background: linear-gradient(135deg, #8a3548 0%, #662435 100%);
          box-shadow: 0 4px 16px rgba(123, 45, 62, 0.4);
          transform: translateY(-2px);
        }

        .sidebar-logout:active {
          transform: translateY(0);
        }

        .logout-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
        }

        .logout-text {
          letter-spacing: 0.3px;
        }

        .logout-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .logout-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 999;
          max-width: 420px;
          width: 90%;
          animation: slideIn 0.3s ease;
        }

        .logout-dialog__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid var(--color-sand);
        }

        .logout-dialog__title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--color-nav-text);
          margin: 0;
        }

        .logout-dialog__close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #666;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .logout-dialog__close:hover {
          background: #eee;
          color: var(--color-nav-text);
        }

        .logout-dialog__content {
          padding: 20px 24px;
        }

        .logout-dialog__message {
          font-family: var(--font-body);
          font-size: 15px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        .logout-dialog__actions {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--color-sand);
        }

        .logout-dialog__button {
          flex: 1;
          padding: 11px 16px;
          border: none;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-dialog__button--cancel {
          background: #f5f5f5;
          color: var(--color-nav-text);
          border: 1px solid var(--color-sand);
        }

        .logout-dialog__button--cancel:hover {
          background: #eee;
          border-color: #ccc;
        }

        .logout-dialog__button--confirm {
          background: linear-gradient(135deg, #7b2d3e 0%, #5a1f2e 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(123, 45, 62, 0.2);
        }

        .logout-dialog__button--confirm:hover {
          background: linear-gradient(135deg, #8a3548 0%, #662435 100%);
          box-shadow: 0 4px 12px rgba(123, 45, 62, 0.3);
        }

        .logout-dialog__button:active {
          transform: scale(0.98);
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
