'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'reception' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0, bookings: 0, payments: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      }).catch(() => null);

      if (!response || !response.ok) {
        router.push('/app/login');
        return;
      }

      const data = await response.json();
      setUserRole(data.role);

      // Fetch stats
      try {
        const [clientsRes, bookingsRes, paymentsRes] = await Promise.all([
          fetch('/api/clinic/clients', { credentials: 'include' }),
          fetch('/api/clinic/bookings', { credentials: 'include' }),
          fetch('/api/clinic/payments', { credentials: 'include' }),
        ]);

        const clientsData = await clientsRes.json();
        const bookingsData = await bookingsRes.json();
        const paymentsData = await paymentsRes.json();

        setStats({
          clients: clientsData.data?.length || 0,
          bookings: bookingsData.data?.length || 0,
          payments: paymentsData.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    } catch (error) {
      router.push('/app/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/app/login');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.png" alt="Sama Wellness" className="header-logo" />
          <div>
            <h1 className="header-title">Sama Wellness Therapy</h1>
            <p className="header-subtitle">Clinic Management Dashboard</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-role">{userRole.toUpperCase()}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <section className="stats-section">
          <h2 className="section-title">Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{stats.clients}</div>
                <div className="stat-label">Total Clients</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-number">{stats.bookings}</div>
                <div className="stat-label">Bookings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <div className="stat-number">{stats.payments}</div>
                <div className="stat-label">Payments</div>
              </div>
            </div>
          </div>
        </section>

        <section className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome to the Clinic Dashboard</h2>
            <p>
              This dashboard provides an overview of your clinic's key metrics and operations.
              Use the API routes to integrate this system with your clinic management workflows.
            </p>
            <div className="info-grid">
              <div className="info-item">
                <h3>📊 Real-time Data</h3>
                <p>All statistics sync directly from your Supabase database</p>
              </div>
              <div className="info-item">
                <h3>🔐 Secure Access</h3>
                <p>Role-based access control for reception and admin users</p>
              </div>
              <div className="info-item">
                <h3>📱 API Ready</h3>
                <p>Full REST API endpoints for all clinic management functions</p>
              </div>
              <div className="info-item">
                <h3>⚡ Built on Supabase</h3>
                <p>PostgreSQL database with real-time capabilities</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: var(--color-linen);
          display: flex;
          flex-direction: column;
        }

        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-linen);
        }

        .spinner {
          width: 50px;
          height: 50px;
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

        .dashboard-loading p {
          margin-top: 20px;
          color: var(--color-nav-text);
          font-family: var(--font-body);
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid var(--color-sand);
          padding: var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex: 1;
        }

        .header-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }

        .header-title {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--color-nav-text);
          margin: 0;
        }

        .header-subtitle {
          font-family: var(--font-body);
          font-size: 13px;
          color: #999;
          margin: 4px 0 0 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .user-role {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--color-burgundy);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .logout-btn {
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

        .logout-btn:hover {
          background: var(--color-sand);
          border-color: var(--color-burgundy);
        }

        .dashboard-main {
          flex: 1;
          padding: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 22px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-lg) 0;
        }

        .stats-section {
          margin-bottom: var(--space-xl);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
        }

        .stat-card {
          background: white;
          padding: var(--space-lg);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: var(--space-md);
          border-left: 4px solid var(--color-burgundy);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 600;
          color: var(--color-nav-text);
          line-height: 1;
        }

        .stat-label {
          font-family: var(--font-body);
          font-size: 13px;
          color: #999;
          margin-top: 4px;
        }

        .welcome-section {
          margin-bottom: var(--space-xl);
        }

        .welcome-card {
          background: white;
          padding: var(--space-xl);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .welcome-card h2 {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-sm) 0;
        }

        .welcome-card > p {
          font-family: var(--font-body);
          color: #666;
          margin: 0 0 var(--space-lg) 0;
          line-height: 1.6;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }

        .info-item h3 {
          font-family: var(--font-display);
          font-size: 14px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-xs) 0;
        }

        .info-item p {
          font-family: var(--font-body);
          font-size: 13px;
          color: #999;
          margin: 0;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--space-md);
            align-items: flex-start;
          }

          .header-content {
            width: 100%;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .dashboard-main {
            padding: var(--space-lg);
          }

          .header-title {
            font-size: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
