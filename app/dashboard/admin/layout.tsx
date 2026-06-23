'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/app/login');
      return;
    }

    // Check if accessing audit-logs and user is not super-admin
    if (
      pathname.includes('audit-logs') &&
      user.role !== 'Super Admin' &&
      !user.permissions?.includes('is_super_admin')
    ) {
      router.push('/dashboard');
      return;
    }

    // Check for manage_roles or manage_users
    if (
      !user.permissions?.includes('manage_roles') &&
      !user.permissions?.includes('manage_users')
    ) {
      router.push('/app/login');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, router, pathname]);

  if (loading || !isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{loading ? 'Loading...' : 'You do not have access to this section.'}</p>
      </div>
    );
  }

  return <>{children}</>;
}
