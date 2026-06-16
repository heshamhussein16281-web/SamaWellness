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
  const [mode, setMode] = useState<'choose' | 'schedule'>('choose'); // 'choose' = direct selection, 'schedule' = do assessment
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

    // For direct selection: therapist must be selected
    if (mode === 'choose' && !selectedTherapistId) {
      setError('Please select a therapist');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'choose') {
        // Direct selection: assign therapist immediately
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
      } else {
        // Schedule assessment: mark as assessment_pending, therapist will be assigned after Sama assesses
        const res = await fetch(`/api/admin/clients/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            status: 'assessment_pending',
            notes: `Assessment scheduled. Client preferences: ${notes || 'None'}`,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to schedule assessment');
        }
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
    const successTitle = mode === 'choose' ? 'Therapist Assigned' : 'Assessment Scheduled';
    const successMessage = mode === 'choose'
      ? `${clientName} has been assigned to a therapist and is ready for booking.`
      : `Assessment scheduled for ${clientName}. Sama will review and assign a therapist.`;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">{successTitle}</h2>
            <p className="modal-success-message">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Therapist Assignment - {clientName}</h2>
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

        {/* Mode Selection Tabs */}
        <div className="modal-mode-selector">
          <button
            type="button"
            className={`modal-mode-btn ${mode === 'choose' ? 'active' : ''}`}
            onClick={() => {
              setMode('choose');
              setError(null);
            }}
          >
            <span className="modal-mode-icon">👤</span>
            <span className="modal-mode-label">Choose Therapist</span>
            <span className="modal-mode-desc">Client selects directly</span>
          </button>
          <button
            type="button"
            className={`modal-mode-btn ${mode === 'schedule' ? 'active' : ''}`}
            onClick={() => {
              setMode('schedule');
              setError(null);
            }}
          >
            <span className="modal-mode-icon">📋</span>
            <span className="modal-mode-label">Do Assessment</span>
            <span className="modal-mode-desc">Sama assigns after assessment</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'choose' && (
            <>
              <div className="modal-form-group">
                <label htmlFor="therapist" className="modal-label">
                  Select Your Therapist <span className="modal-required">*</span>
                </label>
                <p className="modal-help-text">Choose a therapist you'd like to work with</p>
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
                <label htmlFor="preferences" className="modal-label">
                  Preferences <span className="modal-optional">(optional)</span>
                </label>
                <textarea
                  id="preferences"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific preferences or requirements..."
                  className="modal-textarea"
                  rows={2}
                />
              </div>
            </>
          )}

          {mode === 'schedule' && (
            <>
              <div className="modal-info-box">
                <strong>Assessment Process</strong>
                <p>Sama will conduct an assessment and assign the best-fit therapist based on your needs and preferences.</p>
              </div>

              <div className="modal-form-group">
                <label htmlFor="notes" className="modal-label">
                  Client Preferences <span className="modal-optional">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any preferences Sama should know about (e.g., therapist gender, language, specialization)..."
                  className="modal-textarea"
                  rows={3}
                />
              </div>
            </>
          )}

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
              disabled={loading || (mode === 'choose' && fetchingTherapists)}
            >
              {loading ? (mode === 'choose' ? 'Assigning...' : 'Scheduling...') : mode === 'choose' ? 'Confirm Therapist' : 'Schedule Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
