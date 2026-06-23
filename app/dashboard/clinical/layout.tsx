'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ClinicalLayoutProps {
  children: ReactNode;
}

export default function ClinicalLayout({ children }: ClinicalLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/app/login');
      return;
    }

    // Check for clinical access permissions (any of these allows access)
    const hasClinicialAccess = user.permissions?.some((p: string) =>
      ['view_therapists', 'manage_therapists', 'view_clients', 'view_bookings'].includes(p)
    );

    if (!hasClinicialAccess) {
      router.push('/app/login');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{loading ? 'Loading...' : 'You do not have access to this section.'}</p>
      </div>
    );
  }

  return <>{children}</>;
}
