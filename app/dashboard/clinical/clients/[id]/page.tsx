'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClientProfile from '../ClientProfile';
import Link from 'next/link';

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string, 10);

  const [error, setError] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [clinicLoading, setClinicLoading] = useState(true);

  // Fetch primary clinic on mount
  useEffect(() => {
    const fetchPrimaryClinic = async () => {
      try {
        setClinicLoading(true);
        const res = await fetch('/api/admin/clinics', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch clinics');
        }

        const data = await res.json();
        const primaryClinic = data[0];
        if (primaryClinic) {
          setClinicId(primaryClinic.id);
        }
      } catch (err) {
        console.error('Error fetching clinic:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clinic');
      } finally {
        setClinicLoading(false);
      }
    };

    fetchPrimaryClinic();
  }, []);

  if (isNaN(clientId)) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Invalid Client ID</h1>
        <Link href="/dashboard/clinical/clients">Back to Clients</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboard/clinical/clients">
          <button
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            ← Back to Clients
          </button>
        </Link>
      </div>
      <ClientProfile clientId={clientId} clinicId={clinicId} clinicLoading={clinicLoading} />
    </div>
  );
}
