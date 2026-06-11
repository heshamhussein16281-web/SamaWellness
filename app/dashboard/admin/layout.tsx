'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

        // Check if accessing audit-logs and user is not super-admin
        if (
          pathname.includes('audit-logs') &&
          data.role !== 'Super Admin' &&
          !data.permissions?.includes('is_super_admin')
        ) {
          router.push('/app/dashboard');
          return;
        }

        // Check for manage_roles or manage_users
        if (
          !data.permissions?.includes('manage_roles') &&
          !data.permissions?.includes('manage_users')
        ) {
          router.push('/app/login');
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/app/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>You do not have access to this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
