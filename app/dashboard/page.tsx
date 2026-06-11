'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard's roles page (created in Task 4)
    router.push('/dashboard/admin/roles');
  }, [router]);

  return null;
}
