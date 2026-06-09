'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function PayoutsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/clinic/payouts', { credentials: 'include' });
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataTable
      title="Therapist Payouts"
      data={data}
      isLoading={isLoading}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'created_at', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
      ]}
      onAddClick={() => alert('Add form coming soon')}
    />
  );
}
