'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'reception' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid auth token
    const checkAuth = async () => {
      try {
        // Verify token is present by trying to access a protected route
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        }).catch(() => null);

        if (!response || !response.ok) {
          // No valid auth, redirect to login
          router.push('/app/login');
          return;
        }

        const data = await response.json();
        setUserRole(data.role);
        setIsAuthenticated(true);
      } catch (error) {
        // Error checking auth, redirect to login
        router.push('/app/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/app/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/app/login');
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading clinic management system...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="app-dashboard">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">Sama Wellness Therapy</h1>
          <p className="app-subtitle">Clinic Management System</p>
        </div>
        <div className="app-user-info">
          <span className="app-role-badge">{userRole?.toUpperCase()}</span>
          <button onClick={handleLogout} className="app-logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        <div className="app-welcome">
          <h2>Welcome to the Clinic Management System</h2>
          <p>This is the dashboard for managing clients, bookings, and clinic operations.</p>

          {/* Feature Overview */}
          <div className="app-features">
            <div className="feature-box">
              <h3>👥 Clients</h3>
              <p>Manage client records, intake assessments, and therapy stages</p>
            </div>
            <div className="feature-box">
              <h3>📅 Bookings</h3>
              <p>Schedule sessions, track appointment history, and manage availability</p>
            </div>
            <div className="feature-box">
              <h3>💳 Payments</h3>
              <p>Process payments, track invoices, and manage client credits</p>
            </div>
            <div className="feature-box">
              <h3>📊 Reports</h3>
              <p>View analytics, generate reports, and track clinic metrics</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="app-status">
            <h3>System Status</h3>
            <ul>
              <li>✅ Database connection active</li>
              <li>✅ Authentication system operational</li>
              <li>✅ API routes ready</li>
              <li>⏳ Clinic data management features coming soon</li>
            </ul>
          </div>
        </div>
      </main>

      <style jsx>{`
        .app-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-linen) 0%, #f0ebe4 100%);
          font-family: var(--font-body);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--color-sand);
          border-top-color: var(--color-burgundy);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .app-loading p {
          margin-top: 20px;
          color: var(--color-nav-text);
          font-size: 16px;
        }

        .app-dashboard {
          min-height: 100vh;
          background: var(--color-linen);
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: white;
          border-bottom: 1px solid var(--color-sand);
          padding: var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .app-header-content {
          flex: 1;
        }

        .app-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--color-nav-text);
          margin: 0 0 4px 0;
        }

        .app-subtitle {
          font-family: var(--font-body);
          font-size: 14px;
          color: #999;
          margin: 0;
        }

        .app-user-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .app-role-badge {
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--color-burgundy);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .app-logout-btn {
          font-family: var(--font-body);
          font-size: 14px;
          padding: 8px 16px;
          background: #f5f5f5;
          border: 1px solid var(--color-sand);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--color-nav-text);
        }

        .app-logout-btn:hover {
          background: var(--color-sand);
          border-color: var(--color-burgundy);
        }

        .app-content {
          flex: 1;
          padding: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .app-welcome {
          background: white;
          padding: var(--space-xl);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .app-welcome h2 {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-sm) 0;
        }

        .app-welcome > p {
          font-family: var(--font-body);
          color: #666;
          margin: 0 0 var(--space-lg) 0;
        }

        .app-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .feature-box {
          padding: var(--space-md);
          background: #fafafa;
          border: 1px solid var(--color-sand);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .feature-box:hover {
          border-color: var(--color-burgundy);
          box-shadow: 0 4px 12px rgba(123, 45, 62, 0.1);
        }

        .feature-box h3 {
          font-family: var(--font-display);
          font-size: 18px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-xs) 0;
        }

        .feature-box p {
          font-family: var(--font-body);
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .app-status {
          padding: var(--space-md);
          background: #f0f8f5;
          border: 1px solid #c8e6de;
          border-radius: 8px;
        }

        .app-status h3 {
          font-family: var(--font-display);
          font-size: 16px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-sm) 0;
        }

        .app-status ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }

        .app-status li {
          font-family: var(--font-body);
          font-size: 14px;
          color: #333;
        }

        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: var(--space-md);
            align-items: flex-start;
          }

          .app-user-info {
            width: 100%;
            justify-content: space-between;
          }

          .app-content {
            padding: var(--space-lg);
          }

          .app-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
