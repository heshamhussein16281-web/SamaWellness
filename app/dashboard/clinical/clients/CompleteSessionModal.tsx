'use client';

import React, { useState } from 'react';
import './modal.css';

interface CompleteSessionModalProps {
  bookingId?: number;
  clientName: string;
  therapistName?: string;
  sessionDate?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function CompleteSessionModal({
  bookingId,
  clientName,
  therapistName,
  sessionDate,
  onSuccess,
  onClose,
}: CompleteSessionModalProps) {
  const [sessionStatus, setSessionStatus] = useState<'completed' | 'no_show'>('completed');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [progressScore, setProgressScore] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!bookingId) {
      setError('No active booking found for this client. Unable to mark session.');
      return;
    }

    if (sessionStatus === 'completed' && !notes.trim()) {
      setError('Please add session notes if session was completed');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        booking_status: 'completed',
        session_status: sessionStatus,
      };

      if (sessionStatus === 'completed') {
        payload.notes = notes.trim();
        payload.session_outcome = outcome;
        payload.progress_score = progressScore;
      } else if (sessionStatus === 'no_show') {
        payload.notes = notes.trim() ? `No show - ${notes.trim()}` : 'Client did not show for session';
        payload.session_outcome = 'no_show';
        payload.progress_score = null;
      }

      const res = await fetch(`/api/admin/bookings/${bookingId}/complete-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete session');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Session Recorded</h2>
            <p className="modal-success-message">
              {sessionStatus === 'completed'
                ? `Session marked as completed for ${clientName}.`
                : `No-show recorded for ${clientName}. Payment retained.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no booking found
  if (!bookingId) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">No Active Session</h2>
            <button
              className="modal-close-btn"
              onClick={onClose}
              type="button"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="modal-error" style={{ margin: '2rem' }}>
            No active booking found for {clientName}. This client may need to book a session first before you can mark it as completed or no-show.
          </div>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Session Record - {clientName}</h2>
            <p className="modal-subtitle">{therapistName} • {sessionDate ? formatDate(sessionDate) : 'Session date not found'}</p>
          </div>
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

        {/* Session Status Selection */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Completed Option */}
          <button
            onClick={() => setSessionStatus('completed')}
            style={{
              padding: '1rem',
              border: sessionStatus === 'completed' ? '2px solid #4a6741' : '2px solid #ddd',
              borderRadius: '8px',
              background: sessionStatus === 'completed' ? '#f0fdf4' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontWeight: '600', color: '#333' }}>Completed</div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Session delivered
            </div>
          </button>

          {/* No Show Option */}
          <button
            onClick={() => setSessionStatus('no_show')}
            style={{
              padding: '1rem',
              border: sessionStatus === 'no_show' ? '2px solid #c75c5c' : '2px solid #ddd',
              borderRadius: '8px',
              background: sessionStatus === 'no_show' ? '#fef2f2' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✗</div>
            <div style={{ fontWeight: '600', color: '#333' }}>No Show</div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Client absent (payment kept)
            </div>
          </button>
        </div>

        {/* Financial Status Info */}
        <div
          style={{
            padding: '1rem',
            background: '#f9f5f0',
            borderLeft: '4px solid #7b2d3e',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#666' }}>
            💰 FINANCIAL STATUS
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
            {sessionStatus === 'completed'
              ? 'Session delivered - Payment finalized'
              : 'No-show - Payment retained as per policy'}
          </p>
        </div>

        {/* Form Content */}
        {sessionStatus === 'completed' ? (
          <>
            {/* Notes */}
            <div className="modal-form-group">
              <label className="modal-label">
                Session Notes <span className="modal-required">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modal-input"
                placeholder="Summary of session, topics discussed, observations..."
                style={{ minHeight: '100px', fontFamily: 'inherit' }}
                disabled={loading}
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.5rem 0 0 0' }}>
                {notes.length} / 5000 characters
              </p>
            </div>

            {/* Session Outcome */}
            <div className="modal-form-group">
              <label htmlFor="outcome" className="modal-label">
                Session Outcome
              </label>
              <select
                id="outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                className="modal-input"
                disabled={loading}
              >
                <option value="positive">Positive - Client showed good progress</option>
                <option value="neutral">Neutral - Standard session</option>
                <option value="negative">Negative - Client struggled</option>
              </select>
            </div>

            {/* Progress Score */}
            <div className="modal-form-group">
              <label className="modal-label">
                Progress Score
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={progressScore}
                  onChange={(e) => setProgressScore(parseInt(e.target.value))}
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: '1.5rem',
                        color:
                          star <= progressScore ? '#4a6741' : '#ddd',
                        cursor: 'pointer',
                      }}
                      onClick={() => setProgressScore(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.5rem 0 0 0' }}>
                {progressScore} / 5 stars
              </p>
            </div>
          </>
        ) : (
          <>
            {/* No Show Notes */}
            <div className="modal-form-group">
              <label className="modal-label">
                Reason for No-Show (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modal-input"
                placeholder="Why client didn't attend..."
                style={{ minHeight: '80px', fontFamily: 'inherit' }}
                disabled={loading}
              />
            </div>

            {/* No Show Warning */}
            <div
              style={{
                padding: '1rem',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
                ⚠️ <strong>No-Show Policy:</strong> Payment for this session is retained. Client will need to reschedule for next session.
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
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
            disabled={loading || (sessionStatus === 'completed' && !notes.trim())}
          >
            {loading ? 'Recording...' : `Record ${sessionStatus === 'completed' ? 'Completed' : 'No Show'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
