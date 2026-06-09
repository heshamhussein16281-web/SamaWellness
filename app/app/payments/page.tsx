'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function PaymentsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    payment_type: 'session',
    payment_method: 'cash',
    status: 'completed',
    description: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/clinic/payments', { credentials: 'include' });
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/clinic/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSubmitError(error.error || 'Failed to add payment');
        return;
      }

      setSubmitSuccess('Payment added successfully!');
      setFormData({ client_id: '', amount: '', payment_type: 'session', payment_method: 'cash', status: 'completed', description: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setSubmitError('Error adding payment: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#2d4a46', margin: '0 0 10px 0' }}>Payments</h1>
        <p style={{ color: '#999', margin: 0 }}>Record and manage client payments</p>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Record Payment</h2>

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

          <form onSubmit={handleAddPayment}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Client ID</label>
              <input
                type="text"
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Amount (EGP)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Payment Type</label>
              <select
                value={formData.payment_type}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="session">Session</option>
                <option value="package">Package</option>
                <option value="assessment">Assessment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ padding: '12px 24px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Add Payment
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
        title="Payments"
        data={data}
        isLoading={isLoading}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'client_id', label: 'Client ID' },
          { key: 'amount', label: 'Amount', render: (val) => `EGP ${val}` },
          { key: 'payment_type', label: 'Type' },
          { key: 'payment_method', label: 'Method' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
        ]}
        onAddClick={() => setShowForm(!showForm)}
      />
    </div>
  );
}
