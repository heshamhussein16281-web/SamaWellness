'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ClinicalLayoutProps {
  children: ReactNode;
}

export default function ClinicalLayout({ children }: ClinicalLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking clinical section authentication...');
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        console.log('Auth verify response status:', res.status);

        if (!res.ok) {
          console.log('Authentication failed, redirecting to login');
          router.push('/app/login');
          return;
        }

        const data = await res.json();
        console.log('Auth data received:', { username: data.username, role: data.role, permissions: data.permissions });

        // Check for clinical access permissions (any of these allows access)
        const hasClinicialAccess = data.permissions?.some((p: string) =>
          ['view_therapists', 'manage_therapists', 'view_clients', 'view_bookings'].includes(p)
        );

        if (!hasClinicialAccess) {
          console.log('User lacks required permissions for clinical section');
          router.push('/app/login');
          return;
        }

        console.log('Clinical section authorization successful');
        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/app/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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
