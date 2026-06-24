'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface SessionTrackerProps {
  clientId: number;
  clientName: string;
  onClose: () => void;
}

interface Session {
  id: number;
  session_date: string;
  duration_minutes: number;
  therapist_name: string;
  booking_status: string;
  status?: string; // 'completed', 'no_show', or null for pending
  payment_status: string;
  room_name?: string;
  notes?: string;
  payment_amount?: number;
}

export default function SessionTracker({
  clientId,
  clientName,
  onClose,
}: SessionTrackerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [clientId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all bookings
      const res = await fetch(`/api/admin/clients/${clientId}/bookings`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        // Sort by date descending (newest first)
        const sorted = (data.data || []).sort(
          (a: any, b: any) =>
            new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
        );
        setSessions(sorted);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load sessions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionStatusBadge = (session: Session) => {
    if (session.booking_status === 'completed') {
      if (session.status === 'no_show') {
        return { label: 'No Show', color: '#c75c5c', bgColor: '#fef2f2' };
      }
      return { label: 'Completed', color: '#4a6741', bgColor: '#f0fdf4' };
    }
    if (session.booking_status === 'scheduled') {
      return { label: 'Scheduled', color: '#1e6ba8', bgColor: '#f0f9ff' };
    }
    return { label: session.booking_status, color: '#666', bgColor: '#f5f5f5' };
  };

  const getFinancialStatus = (session: Session) => {
    if (session.booking_status === 'completed') {
      return {
        text: 'Delivered',
        subtext: session.status === 'no_show' ? '(Payment kept)' : '(Session conducted)',
        color: '#4a6741',
      };
    }
    if (session.booking_status === 'scheduled') {
      return { text: 'Pending', subtext: 'Awaiting session', color: '#1e6ba8' };
    }
    return { text: 'Cancelled', subtext: '', color: '#999' };
  };

  const stats = {
    total: sessions.length,
    completed: sessions.filter((s) => s.booking_status === 'completed').length,
    noShow: sessions.filter((s) => s.status === 'no_show').length,
    scheduled: sessions.filter((s) => s.booking_status === 'scheduled').length,
  };

  const statusBadge = (session: Session) => {
    const badge = getSessionStatusBadge(session);
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          background: badge.bgColor,
          color: badge.color,
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
        }}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Session Tracker - {clientName}</h2>
            <p className="modal-subtitle">Complete history of all sessions and financial status</p>
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

        {/* Statistics Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: '#f9f5f0',
              borderLeft: '4px solid #7b2d3e',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
              Total Sessions
            </p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>
              {stats.total}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              background: '#f0fdf4',
              borderLeft: '4px solid #4a6741',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
              Completed
            </p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#4a6741' }}>
              {stats.completed}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              background: '#fef2f2',
              borderLeft: '4px solid #c75c5c',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
              No Shows
            </p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#c75c5c' }}>
              {stats.noShow}
            </p>
          </div>

          <div
            style={{
              padding: '1rem',
              background: '#f0f9ff',
              borderLeft: '4px solid #1e6ba8',
              borderRadius: '6px',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
              Scheduled
            </p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e6ba8' }}>
              {stats.scheduled}
            </p>
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              No sessions found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map((session, idx) => {
                const financialStatus = getFinancialStatus(session);
                const isToday = new Date(session.session_date).toDateString() === new Date().toDateString();
                const isPast = new Date(session.session_date) < new Date();
                const isFuture = new Date(session.session_date) > new Date();

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      background: isToday ? '#fffbf0' : '#fafafa',
                      borderLeft: isToday ? '4px solid #f59e0b' : '1px solid #e5e5e5',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                          Date & Time
                        </p>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>
                          {formatDate(session.session_date)} at {formatTime(session.session_date)}
                          {isToday && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.75rem',
                                background: '#f59e0b',
                                color: '#fff',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '3px',
                              }}
                            >
                              TODAY
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                          Therapist
                        </p>
                        <p style={{ margin: 0, fontWeight: '600' }}>{session.therapist_name}</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                          Status
                        </p>
                        {statusBadge(session)}
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                          Financial
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: '600',
                            color: financialStatus.color,
                            fontSize: '0.9rem',
                          }}
                        >
                          {financialStatus.text}
                        </p>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 2fr',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#666',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #eee',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '500' }}>Duration:</span> {session.duration_minutes} min
                      </div>
                      <div>
                        <span style={{ fontWeight: '500' }}>Room:</span> {session.room_name || 'N/A'}
                      </div>
                      <div>
                        <span style={{ fontWeight: '500' }}>Note:</span>{' '}
                        {session.notes || '(no notes)'}
                      </div>
                    </div>

                    {/* Financial Indicator */}
                    {session.booking_status === 'completed' && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          background:
                            session.status === 'no_show'
                              ? '#fef2f2'
                              : '#f0fdf4',
                          borderLeft:
                            session.status === 'no_show'
                              ? '3px solid #c75c5c'
                              : '3px solid #4a6741',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: session.status === 'no_show' ? '#c75c5c' : '#4a6741',
                        }}
                      >
                        💰{' '}
                        {session.status === 'no_show'
                          ? 'No-Show: Payment retained as per policy'
                          : 'Delivered: Session conducted and payment finalized'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f9f5f0',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0', fontWeight: '600' }}>📋 LEGEND</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              ✓ <strong>Completed:</strong> Session conducted, notes recorded
            </div>
            <div>
              ✗ <strong>No Show:</strong> Client absent, payment retained
            </div>
            <div>
              📅 <strong>Scheduled:</strong> Future session pending
            </div>
            <div>
              💰 <strong>Financial:</strong> All delivered sessions = payment kept
            </div>
          </div>
        </div>

        {/* Close Button */}
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
