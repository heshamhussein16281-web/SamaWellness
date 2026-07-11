'use client';

import React, { useEffect, useState } from 'react';
import { HeaderSkeleton, StatsSkeleton, TabSkeleton } from './SkeletonLoader';
import './client-profile.css';
import './skeleton-loader.css';

interface ClientData {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  status: string;
  is_recurring: boolean;
  client_since: string;
  intake_date: string;
  referral_source: string;
  notes: string;
  therapist_id: number | null;
  therapist_name: string | null;
  total_sessions_completed: number;
  total_amount_paid: number;
}

interface Session {
  session_date: string;
  duration_minutes: number;
  therapist_name: string;
  session_outcome: string;
  progress_score: number;
  notes: string;
}

interface SessionsResponse {
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Booking {
  id: number;
  session_date: string;
  therapist_name: string;
  room_name?: string | null;
  booking_status: string;
  payment_status: string;
  amount: number;
  notes?: string | null;
  created_at?: string;
}

interface BookingsResponse {
  data: Booking[];
}

interface Payment {
  payment_date: string;
  amount_paid: number;
  actual_cost: number;
  refund_amount: number;
  additional_charge: number;
  charge_status: string;
  marked_by: string;
}

interface PaymentsResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface StatusHistoryRecord {
  created_at: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  reason: string;
}

interface StatusHistoryResponse {
  data: StatusHistoryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ClientProfileProps {
  clientId: number;
  clinicId?: number | null;
  clinicLoading?: boolean;
}

type TabType = 'information' | 'sessions' | 'bookings' | 'payments' | 'history';

export default function ClientProfile({ clientId, clinicId, clinicLoading = false }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('information');
  const [profile, setProfile] = useState<ClientData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [history, setHistory] = useState<StatusHistoryRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refetch profile function for action button callback
  const refetchProfile = async () => {
    try {
      console.log('[ClientProfile] refetchProfile called for clientId:', clientId);

      // Refetch profile
      const profileUrl = `/api/admin/clients/${clientId}/profile`;
      console.log('[ClientProfile] Fetching from:', profileUrl);

      const res = await fetch(profileUrl, {
        credentials: 'include',
      });

      console.log('[ClientProfile] Profile fetch response status:', res.status);

      if (!res.ok) {
        const errorData = await res.text();
        console.error('[ClientProfile] API returned error:', res.status, errorData);
        throw new Error(`Failed to fetch client profile: ${res.status} ${errorData}`);
      }

      const data = await res.json();
      console.log('[ClientProfile] Profile data received:', {
        id: data.id,
        total_amount_paid: data.total_amount_paid,
        session_payment_received: data.session_payment_received,
        session_payment_amount: data.session_payment_amount,
      });

      console.log('[ClientProfile] Updating profile state with new data');
      setProfile(data);
      console.log('[ClientProfile] ✓ Profile state updated');

      // Also refetch bookings to show updated history
      const bookingsRes = await fetch(`/api/admin/clients/${clientId}/bookings`, {
        credentials: 'include',
      });

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.data || []);
        console.log('[ClientProfile] ✓ Bookings updated');
      } else {
        console.warn('[ClientProfile] Bookings fetch returned status:', bookingsRes.status);
      }
    } catch (err) {
      console.error('[ClientProfile] ❌ Error refetching profile:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  };

  // Tab-level loading states
  const [tabLoading, setTabLoading] = useState({
    sessions: false,
    bookings: false,
    payments: false,
    history: false,
  });

  // Pagination states
  const [sessionsPage, setSessionsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [sessionsPagination, setSessionsPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [paymentsPagination, setPaymentsPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pages: 0, total: 0 });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('[ClientProfile] Initial fetch for clientId:', clientId);
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/clients/${clientId}/profile`, {
          credentials: 'include',
        });

        console.log('[ClientProfile] Initial fetch response status:', res.status);

        if (!res.ok) {
          throw new Error('Failed to fetch client profile');
        }

        const data = await res.json();
        console.log('[ClientProfile] Initial load - received total_amount_paid:', data.total_amount_paid);
        setProfile(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        console.error('[ClientProfile] Initial fetch error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [clientId]);

  // Fetch sessions
  useEffect(() => {
    if (activeTab === 'sessions') {
      const fetchSessions = async () => {
        try {
          setTabLoading(prev => ({ ...prev, sessions: true }));
          const res = await fetch(
            `/api/admin/clients/${clientId}/sessions?page=${sessionsPage}&limit=10`,
            { credentials: 'include' }
          );

          if (!res.ok) throw new Error('Failed to fetch sessions');

          const data: SessionsResponse = await res.json();
          setSessions(data.data);
          setSessionsPagination(data.pagination);
        } catch (err) {
          console.error('Error fetching sessions:', err);
        } finally {
          setTabLoading(prev => ({ ...prev, sessions: false }));
        }
      };

      fetchSessions();
    }
  }, [activeTab, sessionsPage, clientId]);

  // Fetch bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      const fetchBookings = async () => {
        try {
          setTabLoading(prev => ({ ...prev, bookings: true }));
          const res = await fetch(`/api/admin/clients/${clientId}/bookings`, {
            credentials: 'include',
          });

          if (!res.ok) throw new Error('Failed to fetch bookings');

          const data: BookingsResponse = await res.json();
          setBookings(data.data);
        } catch (err) {
          console.error('Error fetching bookings:', err);
        } finally {
          setTabLoading(prev => ({ ...prev, bookings: false }));
        }
      };

      fetchBookings();
    }
  }, [activeTab, clientId]);

  // Fetch payments
  useEffect(() => {
    if (activeTab === 'payments') {
      const fetchPayments = async () => {
        try {
          setTabLoading(prev => ({ ...prev, payments: true }));
          const res = await fetch(
            `/api/admin/clients/${clientId}/payments?page=${paymentsPage}&limit=10`,
            { credentials: 'include' }
          );

          if (!res.ok) throw new Error('Failed to fetch payments');

          const data: PaymentsResponse = await res.json();
          setPayments(data.data);
          setPaymentsPagination(data.pagination);
        } catch (err) {
          console.error('Error fetching payments:', err);
        } finally {
          setTabLoading(prev => ({ ...prev, payments: false }));
        }
      };

      fetchPayments();
    }
  }, [activeTab, paymentsPage, clientId]);

  // Fetch status history
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        try {
          setTabLoading(prev => ({ ...prev, history: true }));
          const res = await fetch(
            `/api/admin/clients/${clientId}/status-history?page=${historyPage}&limit=10`,
            { credentials: 'include' }
          );

          if (!res.ok) throw new Error('Failed to fetch status history');

          const data: StatusHistoryResponse = await res.json();
          setHistory(data.data);
          setHistoryPagination(data.pagination);
        } catch (err) {
          console.error('Error fetching history:', err);
        } finally {
          setTabLoading(prev => ({ ...prev, history: false }));
        }
      };

      fetchHistory();
    }
  }, [activeTab, historyPage, clientId]);

  if (loading) {
    return <div className="client-profile-loading">Loading client profile...</div>;
  }

  if (error) {
    return <div className="client-profile-error">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="client-profile-error">Client not found</div>;
  }

  const statusBadgeClass = `client-profile-badge client-profile-badge--${profile.status}`;

  // Helper to get status icon
  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      intake: '📋',
      assessment_pending: '⏳',
      ready_for_booking: '✓',
      booking_scheduled: '📅',
      payment_pending: '💳',
      active: '🟢',
      completed: '✅',
      inactive: '⏸️',
      booking_expired: '❌',
    };
    return icons[status] || '•';
  };

  const getBookingStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      confirmed: '✓',
      scheduled: '📅',
      completed: '✅',
      cancelled: '❌',
      expired: '⏰',
    };
    return icons[status] || '•';
  };

  const getPaymentStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      paid: '✅',
      unpaid: '⏳',
      partial: '⚠️',
      pending: '💳',
    };
    return icons[status] || '•';
  };

  return (
    <div className="client-profile-container">
      {/* Profile Header - Sticky */}
      <div className="client-profile-header-sticky">
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <div className="client-profile-header">
            <div className="client-profile-header-content">
              <div className="client-profile-title-section">
                <h1 className="client-profile-name">{profile.name}</h1>
                <div className="client-profile-badges">
                  <span className={statusBadgeClass}>
                    {getStatusIcon(profile.status)} {profile.status.replace(/_/g, ' ')}
                  </span>
                  {profile.is_recurring && (
                    <span className="client-profile-badge client-profile-badge--recurring">
                      🔄 Recurring
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="client-profile-stats">
          <div className="client-profile-stat">
            <span className="client-profile-stat-label">Sessions Completed</span>
            <span className="client-profile-stat-value">{profile.total_sessions_completed}</span>
          </div>
          <div className="client-profile-stat">
            <span className="client-profile-stat-label">Total Paid</span>
            <span className="client-profile-stat-value">
              EGP {profile.total_amount_paid.toFixed(2)}
            </span>
          </div>
          <div className="client-profile-stat">
            <span className="client-profile-stat-label">Therapist</span>
            <span className="client-profile-stat-value">
              {profile.therapist_name || 'Not assigned'}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="client-profile-tabs">
        <div className="client-profile-tabs-nav" role="tablist">
          {(['information', 'sessions', 'bookings', 'payments', 'history'] as const).map((tab) => (
            <button
              key={tab}
              className={`client-profile-tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'sessions') setSessionsPage(1);
                if (tab === 'payments') setPaymentsPage(1);
                if (tab === 'history') setHistoryPage(1);
              }}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
            >
              {tab === 'information' && 'Information'}
              {tab === 'sessions' && 'Sessions'}
              {tab === 'bookings' && 'Bookings'}
              {tab === 'payments' && 'Payments'}
              {tab === 'history' && 'Notes & History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="client-profile-tabs-content">
          {/* Information Tab */}
          {activeTab === 'information' && (
            <div className="client-profile-tab-pane">
              <div className="client-profile-info-grid">
                {/* Contact Information Section */}
                <div className="client-profile-info-section">
                  <h3 className="client-profile-info-section-title">Contact Information</h3>
                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Email</label>
                    <p className="client-profile-info-value">{profile.email || 'Not provided'}</p>
                  </div>

                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Phone</label>
                    <p className="client-profile-info-value">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Demographic & Status Section */}
                <div className="client-profile-info-section">
                  <h3 className="client-profile-info-section-title">Demographic & Status</h3>
                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Date of Birth</label>
                    <p className="client-profile-info-value">
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>

                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Status</label>
                    <p className="client-profile-info-value">{profile.status}</p>
                  </div>

                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Client Since</label>
                    <p className="client-profile-info-value">
                      {new Date(profile.client_since).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Intake Date</label>
                    <p className="client-profile-info-value">
                      {profile.intake_date
                        ? new Date(profile.intake_date).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Care Coordination Section */}
                <div className="client-profile-info-section">
                  <h3 className="client-profile-info-section-title">Care Coordination</h3>
                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Referral Source</label>
                    <p className="client-profile-info-value">{profile.referral_source || 'Not provided'}</p>
                  </div>

                  <div className="client-profile-info-item">
                    <label className="client-profile-info-label">Assigned Therapist</label>
                    <p className="client-profile-info-value">{profile.therapist_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {profile.notes && (
                <div className="client-profile-notes-section">
                  <h3 className="client-profile-notes-title">Notes</h3>
                  <p className="client-profile-notes-text">{profile.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="client-profile-tab-pane" id="tabpanel-sessions" role="tabpanel">
              {tabLoading.sessions ? (
                <TabSkeleton />
              ) : sessions.length === 0 ? (
                <div className="client-profile-empty-state">
                  <div className="client-profile-empty-icon">📅</div>
                  <p className="client-profile-empty-title">No sessions completed yet</p>
                  <p className="client-profile-empty-description">
                    Schedule a session to track client progress
                  </p>
                  <button
                    className="client-profile-action-btn client-profile-action-btn--primary"
                    aria-label="Schedule a new session"
                  >
                    + Schedule Session
                  </button>
                </div>
              ) : (
                <>
                  <table className="client-profile-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Therapist</th>
                        <th>Outcome</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session, idx) => (
                        <tr key={idx}>
                          <td>{new Date(session.session_date).toLocaleDateString()}</td>
                          <td>{session.duration_minutes} min</td>
                          <td>{session.therapist_name || '-'}</td>
                          <td>{session.session_outcome || '-'}</td>
                          <td>
                            {session.progress_score !== null ? (
                              <span className="client-profile-progress-badge">
                                {session.progress_score}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {sessionsPagination.pages > 1 && (
                    <div className="client-profile-pagination">
                      <button
                        disabled={sessionsPage === 1}
                        onClick={() => setSessionsPage(Math.max(1, sessionsPage - 1))}
                        className="client-profile-pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="client-profile-pagination-info">
                        Page {sessionsPage} of {sessionsPagination.pages}
                      </span>
                      <button
                        disabled={sessionsPage === sessionsPagination.pages}
                        onClick={() => setSessionsPage(Math.min(sessionsPagination.pages, sessionsPage + 1))}
                        className="client-profile-pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="client-profile-tab-pane" id="tabpanel-bookings" role="tabpanel">
              {tabLoading.bookings ? (
                <TabSkeleton />
              ) : bookings.length === 0 ? (
                <div className="client-profile-empty-state">
                  <div className="client-profile-empty-icon">📅</div>
                  <p className="client-profile-empty-title">No bookings found</p>
                  <p className="client-profile-empty-description">
                    Schedule a new booking to get started
                  </p>
                  <button
                    className="client-profile-action-btn client-profile-action-btn--primary"
                    aria-label="Schedule a new booking"
                  >
                    + Schedule Booking
                  </button>
                </div>
              ) : (
                <table className="client-profile-table">
                  <thead>
                    <tr>
                      <th>Session Date & Time</th>
                      <th>Therapist</th>
                      <th>Room</th>
                      <th>Booking Status</th>
                      <th>Payment Status</th>
                      <th>Amount</th>
                      <th>Booking History / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} style={{ opacity: booking.booking_status === 'cancelled' ? 0.5 : 1 }}>
                        <td style={{ fontWeight: booking.booking_status === 'cancelled' ? 'normal' : '500' }}>
                          {new Date(booking.session_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} {new Date(booking.session_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td>{booking.therapist_name || '-'}</td>
                        <td>{booking.room_name || '-'}</td>
                        <td>
                          <span className={`client-profile-status-badge client-profile-status-badge--${booking.booking_status}`}>
                            {getBookingStatusIcon(booking.booking_status)} {booking.booking_status}
                          </span>
                        </td>
                        <td>
                          <span className={`client-profile-status-badge client-profile-status-badge--${booking.payment_status}`}>
                            {getPaymentStatusIcon(booking.payment_status)} {booking.payment_status}
                          </span>
                        </td>
                        <td>EGP {booking.amount.toFixed(2)}</td>
                        <td style={{ fontSize: '12px', color: '#666', maxWidth: '200px', wordWrap: 'break-word' }}>
                          {booking.notes ? (
                            <span title={booking.notes}>{booking.notes}</span>
                          ) : booking.booking_status === 'cancelled' ? (
                            <span style={{ fontStyle: 'italic', color: '#999' }}>Cancelled</span>
                          ) : (
                            <span style={{ color: '#ccc' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="client-profile-tab-pane" id="tabpanel-payments" role="tabpanel">
              {tabLoading.payments ? (
                <TabSkeleton />
              ) : payments.length === 0 ? (
                <div className="client-profile-empty-state">
                  <div className="client-profile-empty-icon">💳</div>
                  <p className="client-profile-empty-title">No payment records found</p>
                  <p className="client-profile-empty-description">
                    Payment records will appear after the first session
                  </p>
                </div>
              ) : (
                <>
                  <table className="client-profile-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount Paid</th>
                        <th>Cost</th>
                        <th>Refund</th>
                        <th>Extra Charge</th>
                        <th>Status</th>
                        <th>Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, idx) => (
                        <tr key={idx}>
                          <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td>EGP {payment.amount_paid.toFixed(2)}</td>
                          <td>EGP {payment.actual_cost.toFixed(2)}</td>
                          <td>EGP {payment.refund_amount.toFixed(2)}</td>
                          <td>EGP {payment.additional_charge.toFixed(2)}</td>
                          <td>
                            <span className={`client-profile-status-badge client-profile-status-badge--${payment.charge_status}`}>
                              {getPaymentStatusIcon(payment.charge_status)} {payment.charge_status}
                            </span>
                          </td>
                          <td>{payment.marked_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {paymentsPagination.pages > 1 && (
                    <div className="client-profile-pagination">
                      <button
                        disabled={paymentsPage === 1}
                        onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
                        className="client-profile-pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="client-profile-pagination-info">
                        Page {paymentsPage} of {paymentsPagination.pages}
                      </span>
                      <button
                        disabled={paymentsPage === paymentsPagination.pages}
                        onClick={() => setPaymentsPage(Math.min(paymentsPagination.pages, paymentsPage + 1))}
                        className="client-profile-pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Notes & History Tab */}
          {activeTab === 'history' && (
            <div className="client-profile-tab-pane" id="tabpanel-history" role="tabpanel">
              {tabLoading.history ? (
                <TabSkeleton />
              ) : history.length === 0 ? (
                <div className="client-profile-empty-state">
                  <div className="client-profile-empty-icon">📋</div>
                  <p className="client-profile-empty-title">No status history found</p>
                  <p className="client-profile-empty-description">
                    Status changes will appear here as the client progresses
                  </p>
                </div>
              ) : (
                <>
                  <div className="client-profile-timeline">
                    {history.map((record, idx) => (
                      <div key={idx} className="client-profile-timeline-item">
                        <div className="client-profile-timeline-dot" />
                        <div className="client-profile-timeline-content">
                          <p className="client-profile-timeline-text">
                            <strong>
                              {getStatusIcon(record.old_status || 'created')} {record.old_status || 'Created'} → {getStatusIcon(record.new_status)} {record.new_status}
                            </strong>
                          </p>
                          <p className="client-profile-timeline-date">
                            {new Date(record.created_at).toLocaleString()}
                          </p>
                          {record.reason && (
                            <p className="client-profile-timeline-reason">{record.reason}</p>
                          )}
                          {record.changed_by && (
                            <p className="client-profile-timeline-user">By: {record.changed_by}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {historyPagination.pages > 1 && (
                    <div className="client-profile-pagination">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                        className="client-profile-pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="client-profile-pagination-info">
                        Page {historyPage} of {historyPagination.pages}
                      </span>
                      <button
                        disabled={historyPage === historyPagination.pages}
                        onClick={() => setHistoryPage(Math.min(historyPagination.pages, historyPage + 1))}
                        className="client-profile-pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
