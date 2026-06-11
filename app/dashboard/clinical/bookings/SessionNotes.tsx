'use client';

import React, { useEffect, useState } from 'react';
import './session-notes.css';

interface SessionNote {
  id: string;
  therapist_id: number;
  therapist_name: string;
  therapist_email: string;
  notes: string;
  session_outcome?: string;
  progress_score?: number;
  created_at: string;
}

interface SessionNotesProps {
  bookingId: number;
  onClose?: () => void;
}

export default function SessionNotes({ bookingId, onClose }: SessionNotesProps) {
  const [notes, setNotes] = useState('');
  const [sessionOutcome, setSessionOutcome] = useState('');
  const [progressScore, setProgressScore] = useState<number | null>(null);
  const [sessionNotesList, setSessionNotesList] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing session notes
  useEffect(() => {
    const fetchSessionNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/bookings/${bookingId}/session-notes`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch session notes');
        }

        const data = await res.json();
        setSessionNotesList(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionNotes();
  }, [bookingId]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate notes
    if (!notes.trim()) {
      setError('Notes field is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/admin/bookings/${bookingId}/session-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: notes.trim(),
          session_outcome: sessionOutcome.trim() || null,
          progress_score: progressScore,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save notes');
      }

      const data = await res.json();

      // Add the new note to the list
      setSessionNotesList([data.data, ...sessionNotesList]);

      // Reset form
      setNotes('');
      setSessionOutcome('');
      setProgressScore(null);

      setSuccess('Session notes saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressScoreLabel = (score: number | null | undefined) => {
    if (!score) return '';
    const labels: Record<number, string> = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[score] || '';
  };

  return (
    <div className="session-notes-container">
      <div className="session-notes-header">
        <h2 className="session-notes-title">Session Notes</h2>
        {onClose && (
          <button
            className="session-notes-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Form */}
      <form className="session-notes-form" onSubmit={handleSaveNotes}>
        {error && <div className="session-notes-error">{error}</div>}
        {success && <div className="session-notes-success">{success}</div>}

        {/* Notes Textarea */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Session Notes <span className="form-required">*</span>
          </label>
          <textarea
            id="notes"
            className="form-textarea"
            placeholder="Enter detailed session notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            maxLength={5000}
            disabled={saving}
          />
          <div className="form-char-count">
            {notes.length} / 5000 characters
          </div>
        </div>

        {/* Session Outcome Textarea */}
        <div className="form-group">
          <label htmlFor="session-outcome" className="form-label">
            Session Outcome <span className="form-optional">(Optional)</span>
          </label>
          <textarea
            id="session-outcome"
            className="form-textarea"
            placeholder="Summarize the key outcomes from this session..."
            value={sessionOutcome}
            onChange={(e) => setSessionOutcome(e.target.value)}
            rows={4}
            maxLength={1000}
            disabled={saving}
          />
          <div className="form-char-count">
            {sessionOutcome.length} / 1000 characters
          </div>
        </div>

        {/* Progress Score */}
        <div className="form-group">
          <label className="form-label">
            Progress Score <span className="form-optional">(Optional)</span>
          </label>
          <div className="progress-score-group">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score} className="progress-score-label">
                <input
                  type="radio"
                  name="progress_score"
                  value={score}
                  checked={progressScore === score}
                  onChange={() => setProgressScore(score)}
                  disabled={saving}
                  className="progress-score-input"
                />
                <span className="progress-score-value">{score}</span>
                <span className="progress-score-text">
                  {getProgressScoreLabel(score)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
          {onClose && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Session Notes List */}
      <div className="session-notes-list-section">
        <h3 className="session-notes-list-title">
          Session History ({sessionNotesList.length})
        </h3>

        {loading && (
          <div className="session-notes-loading">Loading session notes...</div>
        )}

        {!loading && sessionNotesList.length === 0 && (
          <div className="session-notes-empty">
            <p>No session notes yet. Add the first note above.</p>
          </div>
        )}

        {!loading && sessionNotesList.length > 0 && (
          <div className="session-notes-list">
            {sessionNotesList.map((note) => (
              <div key={note.id} className="session-note-card">
                <div className="session-note-header">
                  <div className="session-note-meta">
                    <h4 className="session-note-therapist">
                      {note.therapist_name}
                    </h4>
                    <p className="session-note-timestamp">
                      {formatDate(note.created_at)}
                    </p>
                  </div>
                  {note.progress_score && (
                    <div className="session-note-score">
                      <span className="score-badge">
                        Score: {note.progress_score}/5
                      </span>
                      <span className="score-label">
                        {getProgressScoreLabel(note.progress_score)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="session-note-body">
                  <div className="session-note-content">
                    <p className="session-note-notes">{note.notes}</p>
                  </div>

                  {note.session_outcome && (
                    <div className="session-note-outcome">
                      <h5 className="session-note-outcome-label">Outcome:</h5>
                      <p className="session-note-outcome-text">
                        {note.session_outcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
