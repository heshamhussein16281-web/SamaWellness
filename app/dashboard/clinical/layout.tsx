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
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/app/login');
          return;
        }

        const data = await res.json();

        // Check for clinical access permissions
        if (
          !data.permissions?.includes('manage_users') &&
          !data.permissions?.includes('view_therapists') &&
          !data.permissions?.includes('manage_therapists')
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
