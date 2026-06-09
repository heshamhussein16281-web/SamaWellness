'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/DataTable';

export default function AssessmentsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    assessment_type: '',
    results: '',
    therapist_notes: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/clinic/assessments', { credentials: 'include' });
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/clinic/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setSubmitError(error.error || 'Failed to add assessment');
        return;
      }

      setSubmitSuccess('Assessment added successfully!');
      setFormData({ client_id: '', assessment_type: '', results: '', therapist_notes: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      setSubmitError('Error adding assessment: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', color: '#2d4a46', margin: '0 0 10px 0' }}>Assessments</h1>
        <p style={{ color: '#999', margin: 0 }}>Track client assessments and progress</p>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Create New Assessment</h2>

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

          <form onSubmit={handleAddAssessment}>
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
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Assessment Type</label>
              <input
                type="text"
                required
                placeholder="e.g., PHQ-9, GAD-7, MMPI-2"
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Results</label>
              <textarea
                required
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px', minHeight: '100px' }}
                placeholder="Enter assessment results and scores"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Therapist Notes</label>
              <textarea
                value={formData.therapist_notes}
                onChange={(e) => setFormData({ ...formData, therapist_notes: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px', minHeight: '100px' }}
                placeholder="Clinical observations and recommendations"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ padding: '12px 24px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
              >
                Create Assessment
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
        title="Assessments"
        data={data}
        isLoading={isLoading}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'client_id', label: 'Client ID' },
          { key: 'assessment_type', label: 'Type' },
          { key: 'created_at', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
        ]}
        onAddClick={() => setShowForm(!showForm)}
      />
    </div>
  );
}
