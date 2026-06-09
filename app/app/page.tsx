'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'reception' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0, bookings: 0, payments: 0 });

  useEffect(() => {
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
        setIsAuthenticated(true);

        // Fetch stats
        try {
          const clientsRes = await fetch('/api/clinic/clients', { credentials: 'include' });
          const bookingsRes = await fetch('/api/clinic/bookings', { credentials: 'include' });
          const paymentsRes = await fetch('/api/clinic/payments', { credentials: 'include' });

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

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading clinic management system...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-dashboard">
      <div className="app-content">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Clinic Management System</p>
          </div>
          <div className="user-badge">
            <span>{userRole?.toUpperCase()}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.clients}</div>
              <div className="stat-label">Clients</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.bookings}</div>
              <div className="stat-label">Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.payments}</div>
              <div className="stat-label">Payments</div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-section">
          <h2 className="section-title">System Overview</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>🎯 Core Features</h3>
              <ul>
                <li>Client management & tracking</li>
                <li>Session booking & scheduling</li>
                <li>Payment processing</li>
                <li>Therapist management</li>
              </ul>
            </div>
            <div className="overview-card">
              <h3>📊 Advanced Tools</h3>
              <ul>
                <li>Assessment tracking</li>
                <li>Satisfaction surveys</li>
                <li>Therapist reassignments</li>
                <li>Financial reports</li>
              </ul>
            </div>
            <div className="overview-card">
              <h3>✅ Admin Features</h3>
              <ul>
                <li>Change log & audit trail</li>
                <li>Expense tracking</li>
                <li>Therapist payouts</li>
                <li>Client discharge</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="tips-section">
          <h3>💡 Quick Tips</h3>
          <p>Use the sidebar navigation to access all 13 clinic management modules. Each module provides full CRUD operations for managing clinic data efficiently.</p>
        </div>
      </div>

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
        }

        .app-content {
          padding: var(--space-xl);
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
        }

        .dashboard-title {
          font-family: var(--font-display);
          font-size: 32px;
          color: var(--color-nav-text);
          margin: 0 0 4px 0;
        }

        .dashboard-subtitle {
          font-family: var(--font-body);
          font-size: 14px;
          color: #999;
          margin: 0;
        }

        .user-badge {
          background: var(--color-burgundy);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
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
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 600;
          color: var(--color-nav-text);
          margin: 0;
        }

        .stat-label {
          font-family: var(--font-body);
          font-size: 12px;
          color: #999;
          margin: 4px 0 0 0;
        }

        .overview-section {
          margin-bottom: var(--space-xl);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-lg) 0;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .overview-card {
          background: white;
          padding: var(--space-lg);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .overview-card h3 {
          font-family: var(--font-display);
          font-size: 16px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-md) 0;
        }

        .overview-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .overview-card li {
          font-family: var(--font-body);
          font-size: 14px;
          color: #666;
          padding-left: 20px;
          position: relative;
        }

        .overview-card li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-olive);
          font-weight: bold;
        }

        .tips-section {
          background: #f0f8f5;
          border: 1px solid #c8e6de;
          border-radius: 8px;
          padding: var(--space-lg);
        }

        .tips-section h3 {
          font-family: var(--font-display);
          font-size: 16px;
          color: var(--color-nav-text);
          margin: 0 0 var(--space-sm) 0;
        }

        .tips-section p {
          font-family: var(--font-body);
          font-size: 14px;
          color: #333;
          margin: 0;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: var(--space-md);
          }

          .dashboard-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
