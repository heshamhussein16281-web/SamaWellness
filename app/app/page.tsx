'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to clinic app on load
    router.push('/app/clinic');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#999' }}>
        <p>Loading clinic app...</p>
      </div>
    </div>
  );
}
