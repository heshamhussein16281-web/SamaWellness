'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're on the login page
  const isLoginPage = pathname === '/app/login';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (!isLoginPage) {
          router.push('/app/login');
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
      setLoading(false);
    } catch (err) {
      if (!isLoginPage) {
        router.push('/app/login');
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/app/login');
  };

  // For login page, just render children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For authenticated pages, show loading or sidebar + content
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { label: 'Dashboard', href: '/app', icon: '📊' },
    { label: 'Clients', href: '/app/clients', icon: '👥' },
    { label: 'Bookings', href: '/app/bookings', icon: '📅' },
    { label: 'Payments', href: '/app/payments', icon: '💳' },
    { label: 'Assessments', href: '/app/assessments', icon: '📝' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F2EE' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid #ddd', padding: '20px', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', color: '#2d4a46', margin: '0 0 30px 0' }}>SWT Clinic</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div style={{ padding: '12px', borderRadius: '6px', cursor: 'pointer', background: pathname === item.href ? '#e8d5cc' : '#f5f5f5', color: '#2d4a46', textDecoration: 'none', display: 'block', fontWeight: pathname === item.href ? 600 : 400 }}>
                {item.icon} {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', flex: 1, padding: '40px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
