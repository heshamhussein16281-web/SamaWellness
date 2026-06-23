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
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (redirecting) return; // Prevent multiple redirects

    if (!user) {
      setRedirecting(true);
      router.push('/app/login');
      return;
    }

    // Check for clinical access permissions (any of these allows access)
    const hasClinicialAccess = user.permissions?.some((p: string) =>
      ['view_therapists', 'manage_therapists', 'view_clients', 'view_bookings'].includes(p)
    );

    if (!hasClinicialAccess) {
      setRedirecting(true);
      router.push('/app/login');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, router, redirecting]);

  // Show loading state while auth is being verified
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authorized, show access denied message
  if (!isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>You do not have access to this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
