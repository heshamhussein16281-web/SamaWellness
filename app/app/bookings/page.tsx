'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function BookingsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    therapist_id: '',
    session_date: '',
    duration_minutes: 60,
    status: 'scheduled',
    notes: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/clinic/bookings', { credentials: 'include' });
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/clinic/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setSubmitError(error.error || 'Failed to add booking');
        return;
      }

      setSubmitSuccess('Booking added successfully!');
      setFormData({ client_id: '', therapist_id: '', session_date: '', duration_minutes: 60, status: 'scheduled', notes: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setSubmitError('Error adding booking: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#2d4a46', margin: '0 0 10px 0' }}>Bookings</h1>
        <p style={{ color: '#999', margin: 0 }}>Schedule and manage therapy sessions</p>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Book New Session</h2>

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

          <form onSubmit={handleAddBooking}>
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
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Therapist ID</label>
              <input
                type="text"
                required
                value={formData.therapist_id}
                onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Session Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ padding: '12px 24px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Add Booking
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
        title="Bookings"
        data={data}
        isLoading={isLoading}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'client_id', label: 'Client ID' },
          { key: 'therapist_id', label: 'Therapist ID' },
          { key: 'session_date', label: 'Session Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
          { key: 'duration_minutes', label: 'Duration' },
          { key: 'status', label: 'Status' },
        ]}
        onAddClick={() => setShowForm(!showForm)}
      />
    </div>
  );
}
