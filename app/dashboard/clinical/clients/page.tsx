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
}

type ViewMode = 'list' | 'intake';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    if (viewMode === 'list') {
      const fetchClients = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch('/api/admin/clients', {
            credentials: 'include',
          });

          if (!res.ok) {
            throw new Error('Failed to fetch clients');
          }

          const data = await res.json();
          setClients(data.data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchClients();
    }
  }, [viewMode]);

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

      {loading && <div className="clients-page-loading">Loading clients...</div>}
      {error && <div className="clients-page-error">Error: {error}</div>}

      {!loading && clients.length === 0 && (
        <div className="clients-page-empty">
          <p>No clients found. Start by adding a new client intake.</p>
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
                <th>Therapist</th>
                <th>Client Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>
                    <span className={`client-status-badge client-status-badge--${client.status}`}>
                      {client.status}
                    </span>
                  </td>
                  <td>{client.therapist_name || 'Not assigned'}</td>
                  <td>{new Date(client.client_since).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/app/dashboard/clinical/clients/${client.id}`}>
                      <button className="client-action-btn">View Profile</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
