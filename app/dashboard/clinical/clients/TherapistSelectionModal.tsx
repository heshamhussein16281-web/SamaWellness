'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface TherapistSelectionModalProps {
  clientId: number;
  clientName: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface Therapist {
  id: number;
  name: string;
  specialization?: string;
}

export default function TherapistSelectionModal({
  clientId,
  clientName,
  onSuccess,
  onClose,
}: TherapistSelectionModalProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await fetch('/api/admin/therapists', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch therapists');
        }
        const data = await res.json();
        setTherapists(data.therapists || data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load therapists');
        console.error(err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleSubmit = async () => {
    if (!selectedTherapistId) {
      setError('Please select a therapist');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Assign therapist and update status to ready_for_booking
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          therapist_id: selectedTherapistId,
          status: 'ready_for_booking',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign therapist');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading-container">
            <div className="modal-loading">Loading therapists...</div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Therapist Assigned</h2>
            <p className="modal-success-message">
              {therapists.find(t => t.id === selectedTherapistId)?.name} has been assigned to {clientName}.
              <br/>
              You can now proceed to book a session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Select Therapist - {clientName}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">
          <div className="modal-form-group">
            <label htmlFor="therapist" className="modal-label">
              Select a Therapist <span className="modal-required">*</span>
            </label>
            <select
              id="therapist"
              value={selectedTherapistId || ''}
              onChange={(e) => setSelectedTherapistId(parseInt(e.target.value, 10))}
              className="modal-input"
              required
            >
              <option value="">Choose a therapist...</option>
              {therapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                  {therapist.specialization ? ` - ${therapist.specialization}` : ''}
                </option>
              ))}
            </select>
            {therapists.length === 0 && (
              <p className="modal-warning">No therapists available</p>
            )}
          </div>

          <div className="modal-info-box">
            <p>Select a therapist to be assigned to this client. After assignment, you can book their sessions.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--primary"
            onClick={handleSubmit}
            disabled={loading || !selectedTherapistId || therapists.length === 0}
          >
            {loading ? 'Assigning...' : 'Assign Therapist'}
          </button>
        </div>
      </div>
    </div>
  );
}
