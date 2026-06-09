'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        credentials: 'include',
      });

      if (!res.ok) {
        router.push('/app/login');
        return;
      }

      const data = await res.json();
      setUser(data);
      setLoading(false);
    } catch (err) {
      router.push('/app/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/app/login');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EE', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '8px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#2d4a46' }}>Dashboard</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>Clinic Management System</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ background: '#7b2d3e', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
              {user.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              style={{ padding: '8px 16px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Welcome!</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            You are now logged in to the Sama Wellness Therapy clinic management system.
            This is your dashboard. Additional features coming soon.
          </p>
        </div>

        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d4a46' }}>Session Information</h3>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
            <strong>Username:</strong> {user.username}
          </p>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

      </div>
    </div>
  );
}
