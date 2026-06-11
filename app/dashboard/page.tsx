'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from './components/Topbar';

export default function DashboardHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to roles page by default
    router.push('/app/dashboard/admin/roles');
  }, [router]);

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Welcome to Sama Wellness Admin" />
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
