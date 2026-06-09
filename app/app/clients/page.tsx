'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clinic/clients', {
        credentials: 'include',
      });
      const result = await response.json();
      setClients(result.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataTable
      title="Clients"
      data={clients}
      isLoading={isLoading}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'stage', label: 'Stage' },
        {
          key: 'created_at',
          label: 'Created',
          render: (val) => new Date(val).toLocaleDateString(),
        },
      ]}
      onAddClick={() => alert('Add client form coming soon')}
    />
  );
}
