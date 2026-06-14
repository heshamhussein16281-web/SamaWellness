'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IntakeForm from './IntakeForm';
import './clients-list.css';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  client_since: string;
  therapist_name: string;
  is_recurring?: boolean;
  total_sessions_completed?: number;
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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchClients = async (page: number = 1, phone: string = '') => {
    try {
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
      setClients(data.data || []);
      setPagination(data.pagination || {});
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    // After successful intake, show a success message and go back to list
    setTimeout(() => {
      setViewMode('list');
    }, 2000);
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
    <div className="clients-page">
      <div className="clients-page-header">
        <h1 className="clients-page-title">Clients</h1>
        <button
          className="clients-page-btn clients-page-btn--primary"
          onClick={() => setViewMode('intake')}
        >
          + New Client Intake
        </button>
      </div>

      {viewMode === 'list' && (
        <div className="clients-search-section">
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
            />
            {searchPhone && (
              <button
                className="clients-search-clear"
                onClick={() => handleSearch('')}
              >
                ✕ Clear
              </button>
            )}
          </div>
          {searchPhone && (
            <div className="clients-search-info">
              Found {pagination.total} client{pagination.total !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {loading && <div className="clients-page-loading">Loading clients...</div>}
      {error && <div className="clients-page-error">Error: {error}</div>}

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
        <div className="clients-list">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Recurring</th>
                <th>Sessions</th>
                <th>Therapist</th>
                <th>Client Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <span className="client-name">{client.name}</span>
                  </td>
                  <td className="client-email">{client.email || '-'}</td>
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
                  <td className="client-since-date">
                    {formatClientSince(client.client_since)}
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

          {pagination.pages > 1 && (
            <div className="clients-pagination">
              <button
                className="clients-pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                ← First
              </button>
              <button
                className="clients-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="clients-pagination-info">
                Page {pagination.page} of {pagination.pages}
                <span className="clients-pagination-count">
                  ({pagination.total} total)
                </span>
              </div>

              <button
                className="clients-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next →
              </button>
              <button
                className="clients-pagination-btn"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={currentPage === pagination.pages}
              >
                Last →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
