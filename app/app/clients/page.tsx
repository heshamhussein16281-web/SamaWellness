'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    stage: 'intake',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/clinic/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setSubmitError(error.error || 'Failed to add client');
        return;
      }

      setSubmitSuccess('Client added successfully!');
      setFormData({ name: '', email: '', phone: '', date_of_birth: '', stage: 'intake' });
      setShowForm(false);
      fetchClients();
    } catch (error) {
      setSubmitError('Error adding client: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#2d4a46', margin: '0 0 10px 0' }}>Clients</h1>
        <p style={{ color: '#999', margin: 0 }}>Manage your clinic clients</p>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Add New Client</h2>

          {submitError && (
            <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fcc' }}>
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div style={{ background: '#eef', color: '#33c', padding: '12px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #ccf' }}>
              {submitSuccess}
            </div>
          )}

          <form onSubmit={handleAddClient}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="intake">Intake</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ padding: '12px 24px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Add Client
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: '12px 24px', background: '#ddd', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
            render: (val) => val ? new Date(val).toLocaleDateString() : '-',
          },
        ]}
        onAddClick={() => setShowForm(!showForm)}
      />
    </div>
  );
}
