'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to roles page by default
    router.push('/app/dashboard/admin/roles');
  }, [router]);

  return null;
}
