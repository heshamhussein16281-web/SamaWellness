'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface SessionHistoryProps {
  clientId: number;
  clientName: string;
  therapistName?: string;
  onClose: () => void;
}

interface SessionWithNotes {
  session_date: string;
  duration_minutes: number;
  therapist_name: string | null;
  session_outcome: string | null;
  progress_score: number | null;
  notes: string | null;
}

interface FutureSession {
  id: number;
  session_date: string;
  duration_minutes: number;
  therapist_name: string;
  room_name?: string;
  booking_status: string;
}

export default function SessionHistory({
  clientId,
  clientName,
  therapistName,
  onClose,
}: SessionHistoryProps) {
  const [pastSessions, setPastSessions] = useState<SessionWithNotes[]>([]);
  const [futureSessions, setFutureSessions] = useState<FutureSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'past' | 'future'>('past');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch completed (past) sessions
        const pastRes = await fetch(
          `/api/admin/clients/${clientId}/sessions?page=1&limit=50`,
          { credentials: 'include' }
        );

        if (pastRes.ok) {
          const pastData = await pastRes.json();
          setPastSessions(pastData.data || []);
        } else {
          console.error('Failed to fetch past sessions');
        }

        // Fetch future sessions
        const futureRes = await fetch(
          `/api/admin/clients/${clientId}/bookings?status=scheduled&page=1&limit=50`,
          { credentials: 'include' }
        );

        if (futureRes.ok) {
          const futureData = await futureRes.json();
          setFutureSessions(futureData.data || []);
        } else {
          console.error('Failed to fetch future sessions');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load sessions';
        setError(message);
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getProgressColor = (score: number | null) => {
    if (!score) return '#ccc';
    if (score >= 4) return '#4a6741'; // Green (olive)
    if (score === 3) return '#f59e0b'; // Amber
    return '#c75c5c'; // Red
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Session History - {clientName}</h2>
            <p className="modal-subtitle">{therapistName && `Therapist: ${therapistName}`}</p>
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('past')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'past' ? '600' : '400',
              borderBottom: activeTab === 'past' ? '2px solid #7b2d3e' : 'none',
              color: activeTab === 'past' ? '#7b2d3e' : '#888',
            }}
          >
            ✓ Completed Sessions ({pastSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('future')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'future' ? '600' : '400',
              borderBottom: activeTab === 'future' ? '2px solid #7b2d3e' : 'none',
              color: activeTab === 'future' ? '#7b2d3e' : '#888',
            }}
          >
            📅 Scheduled Sessions ({futureSessions.length})
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Loading sessions...
          </div>
        ) : activeTab === 'past' ? (
          // Past Sessions Tab
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {pastSessions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                No completed sessions yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pastSessions.map((session, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      background: '#fafafa',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Date</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>
                          {formatDate(session.session_date)} at {formatTime(session.session_date)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Duration</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>{session.duration_minutes} minutes</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Therapist</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>{session.therapist_name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Progress Score & Outcome */}
                    {(session.progress_score || session.session_outcome) && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '0.75rem',
                          background: '#fff',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                        }}
                      >
                        {session.progress_score && (
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>Progress</p>
                            <div
                              style={{
                                display: 'flex',
                                gap: '0.25rem',
                              }}
                            >
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  style={{
                                    fontSize: '1.5rem',
                                    color:
                                      star <= session.progress_score ? getProgressColor(session.progress_score) : '#ddd',
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {session.session_outcome && (
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>Outcome</p>
                            <p
                              style={{
                                margin: 0,
                                padding: '0.5rem 0.75rem',
                                background: session.session_outcome === 'positive' ? '#D4EDDA' : '#FFF3CD',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textTransform: 'capitalize',
                              }}
                            >
                              {session.session_outcome}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Session Notes */}
                    {session.notes && (
                      <div
                        style={{
                          padding: '0.75rem',
                          background: '#f0f4f8',
                          borderLeft: '3px solid #7b2d3e',
                          borderRadius: '4px',
                        }}
                      >
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#666', fontWeight: '500' }}>
                          NOTES
                        </p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#333', lineHeight: '1.5' }}>
                          {session.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Future Sessions Tab
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {futureSessions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                No scheduled sessions
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {futureSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      background: '#fafafa',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Date & Time</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>
                          {formatDate(session.session_date)} at {formatTime(session.session_date)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Duration</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>{session.duration_minutes} minutes</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>Room</p>
                        <p style={{ margin: 0, fontWeight: '600' }}>{session.room_name || 'TBD'}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#D4EDDA',
                          color: '#155724',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                        }}
                      >
                        {session.booking_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
