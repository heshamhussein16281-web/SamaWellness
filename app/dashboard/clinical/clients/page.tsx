'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IntakeForm from './IntakeForm';
import ClientActionButton from './ClientActionButton';
import './clients-list.css';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  client_since: string;
  therapist_id?: number | null;
  therapist_name?: string | null;
  is_recurring?: boolean;
  total_sessions_completed?: number;
  assessment_payment_verified?: boolean;
  assessment_payment_amount?: number | null;
  therapist_fee_payment_verified?: boolean;
  therapist_fee_payment_amount?: number | null;
  total_payment_due?: number | null;
}

type ViewMode = 'list' | 'intake';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchPhone, setSearchPhone] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [clinicLoading, setClinicLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchClients = async (page: number = 1, phone: string = '') => {
    try {
      console.log('[ClientsPage] fetchClients called with page:', page, 'phone:', phone);
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });

      if (phone.trim()) {
        params.append('phone', phone.trim());
      }

      const res = await fetch(`/api/admin/clients?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await res.json();
      console.log('[ClientsPage] fetchClients completed - got', data.data?.length, 'clients');
      console.log('[ClientsPage] Pagination from API:', data.pagination);
      console.log('[ClientsPage] First client status:', data.data?.[0]?.status);
      setClients(data.data || []);

      // Ensure pagination is set correctly
      const paginationData = data.pagination || {
        page: page,
        limit: 10,
        total: data.data?.length || 0,
        pages: Math.ceil((data.data?.length || 0) / 10),
      };
      console.log('[ClientsPage] Setting pagination to:', paginationData);
      setPagination(paginationData);
      setCurrentPage(page);
    } catch (err) {
      console.error('[ClientsPage] fetchClients error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch primary clinic on component mount
  useEffect(() => {
    const fetchPrimaryClinic = async () => {
      try {
        setClinicLoading(true);
        const res = await fetch('/api/admin/clinics', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          // API returns { clinics: [...] }, not { data: [...] }
          if (data.clinics && data.clinics.length > 0) {
            const id = data.clinics[0].id;
            console.log('[ClientsPage] Primary clinic ID:', id);
            setClinicId(typeof id === 'string' ? parseInt(id, 10) : id);
          } else {
            console.warn('[ClientsPage] No clinics found in response');
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('[ClientsPage] Failed to fetch clinics:', res.status, errorData);
        }
      } catch (err) {
        console.error('[ClientsPage] Failed to fetch clinics:', err);
      } finally {
        setClinicLoading(false);
      }
    };
    fetchPrimaryClinic();
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchClients(1, searchPhone);
    }
  }, [viewMode]);

  const handleSearch = (phone: string) => {
    setSearchPhone(phone);
    setCurrentPage(1);
    fetchClients(1, phone);
  };

  const handlePageChange = (page: number) => {
    fetchClients(page, searchPhone);
  };

  const handleIntakeSuccess = (clientId: number, clientName: string) => {
    // After successful intake, refresh the client list and go back to list view
    setSearchPhone('');
    setViewMode('list');
    // Wait a bit longer for database to commit, then refresh
    setTimeout(() => {
      fetchClients(1, '');
    }, 3000);
  };

  if (viewMode === 'intake') {
    return (
      <IntakeForm
        onSuccess={handleIntakeSuccess}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      intake: 'Intake',
      assessment_pending: 'Assessment Pending',
      ready_for_booking: 'Ready for Booking',
      booking_scheduled: 'Booking Scheduled',
      payment_pending: 'Payment Pending',
      active: 'Active',
      completed: 'Completed',
      inactive: 'Inactive',
      booking_expired: 'Booking Expired',
    };
    return labels[status] || status;
  };

  const formatClientSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="clients-page">
      <header className="clients-page-header">
        <h1 className="clients-page-title">Clients</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="clients-page-btn clients-page-btn--primary"
            onClick={() => setViewMode('intake')}
            aria-label="Create new client intake"
          >
            + New Client Intake
          </button>
          <button
            className="clients-page-btn clients-page-btn--secondary"
            onClick={() => window.location.href = '/app'}
            aria-label="Go to legacy dashboard"
            style={{ backgroundColor: '#f0f0f0', color: '#666' }}
          >
            ← Legacy Dashboard
          </button>
        </div>
      </header>

      {viewMode === 'list' && (
        <section className="clients-search-section" aria-label="Client search">
          <div className="clients-search-box">
            <label htmlFor="phone-search" className="clients-search-label">
              Search by Phone:
            </label>
            <input
              id="phone-search"
              type="text"
              placeholder="Enter phone number..."
              value={searchPhone}
              onChange={(e) => handleSearch(e.target.value)}
              className="clients-search-input"
              aria-label="Phone number search"
            />
            {searchPhone && (
              <button
                className="clients-search-clear"
                onClick={() => handleSearch('')}
                aria-label="Clear search"
              >
                ✕ Clear
              </button>
            )}
          </div>
          {searchPhone && (
            <div className="clients-search-info" role="status">
              Found {pagination.total} client{pagination.total !== 1 ? 's' : ''}
            </div>
          )}
        </section>
      )}

      {loading && <div className="clients-page-loading" role="status">Loading clients...</div>}
      {error && <div className="clients-page-error" role="alert">Error: {error}</div>}

      {!loading && clients.length === 0 && (
        <div className="clients-page-empty">
          <p>
            {searchPhone
              ? 'No clients found with that phone number.'
              : 'No clients found. Start by adding a new client intake.'}
          </p>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <section className="clients-list" aria-label="Clients list">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Recurring</th>
                <th>Sessions</th>
                <th>Therapist</th>
                <th>Next Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <span className="client-name">{client.name}</span>
                  </td>
                  <td className="client-phone">{client.phone || '-'}</td>
                  <td>
                    <span className={`client-status-badge client-status-badge--${client.status}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </td>
                  <td>
                    {client.is_recurring ? (
                      <span className="client-recurring-badge">
                        🔄 Recurring
                      </span>
                    ) : (
                      <span className="client-one-time">One-time</span>
                    )}
                  </td>
                  <td>
                    <span className="client-sessions-count">
                      {client.total_sessions_completed || 0}
                    </span>
                  </td>
                  <td>{client.therapist_name || 'Not assigned'}</td>
                  <td>
                    <ClientActionButton
                      clientId={client.id}
                      clientName={client.name}
                      status={client.status}
                      therapistId={client.therapist_id || undefined}
                      therapistName={client.therapist_name || undefined}
                      isRecurring={client.is_recurring || false}
                      clinicId={clinicId || undefined}
                      clinicLoading={clinicLoading}
                      assessmentPaymentVerified={client.assessment_payment_verified || false}
                      assessmentPaymentAmount={client.assessment_payment_amount || undefined}
                      therapistFeePaymentVerified={client.therapist_fee_payment_verified || false}
                      therapistFeePaymentAmount={client.therapist_fee_payment_amount || undefined}
                      totalPaymentDue={client.total_payment_due || undefined}
                      onActionComplete={() => fetchClients(currentPage, searchPhone)}
                    />
                  </td>
                  <td>
                    <Link href={`/dashboard/clinical/clients/${client.id}`}>
                      <button className="client-action-btn">View Profile</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav className="clients-pagination" aria-label="Pagination">
            <button
              className="clients-pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || pagination.pages <= 1}
              aria-label="First page"
            >
              ← First
            </button>
            <button
              className="clients-pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || pagination.pages <= 1}
              aria-label="Previous page"
            >
              ← Previous
            </button>

            <div className="clients-pagination-info" aria-current="page">
              Page {pagination.page} of {pagination.pages}
              <span className="clients-pagination-count">
                ({pagination.total} total)
              </span>
            </div>

            <button
              className="clients-pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages || pagination.pages <= 1}
              aria-label="Next page"
            >
              Next →
            </button>
            <button
              className="clients-pagination-btn"
              onClick={() => handlePageChange(pagination.pages)}
              disabled={currentPage === pagination.pages || pagination.pages <= 1}
              aria-label="Last page"
            >
              Last →
            </button>
          </nav>
        </section>
      )}
    </main>
  );
}
