'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface AssessmentEntryModalProps {
  clientId: number;
  clientName: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface Therapist {
  id: number;
  name: string;
}

export default function AssessmentEntryModal({
  clientId,
  clientName,
  onSuccess,
  onClose,
}: AssessmentEntryModalProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTherapists, setFetchingTherapists] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await fetch('/api/admin/therapists', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTherapists(data.therapists || data.data || []);
        } else {
          throw new Error('Failed to fetch therapists');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch therapists');
      } finally {
        setFetchingTherapists(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTherapistId) {
      setError('Please select a therapist');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          therapist_id: selectedTherapistId,
          status: 'ready_for_booking',
          notes: notes || undefined,
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

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Therapist Assigned</h2>
            <p className="modal-success-message">
              {clientName} has been assigned to a therapist and is ready for booking.
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
          <h2 className="modal-title">Assign Therapist to {clientName}</h2>
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

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label htmlFor="therapist" className="modal-label">
              Select Therapist <span className="modal-required">*</span>
            </label>
            {fetchingTherapists ? (
              <div className="modal-loading">Loading therapists...</div>
            ) : (
              <select
                id="therapist"
                value={selectedTherapistId || ''}
                onChange={(e) => setSelectedTherapistId(parseInt(e.target.value, 10))}
                className="modal-input"
                required
              >
                <option value="">Choose a therapist</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-form-group">
            <label htmlFor="notes" className="modal-label">
              Assessment Notes <span className="modal-optional">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or special notes from the assessment..."
              className="modal-textarea"
              rows={3}
            />
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
              type="submit"
              className="modal-btn modal-btn--primary"
              disabled={loading || fetchingTherapists}
            >
              {loading ? 'Assigning...' : 'Assign Therapist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
