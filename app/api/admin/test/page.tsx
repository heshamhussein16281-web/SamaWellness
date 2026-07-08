'use client';

import React, { useState } from 'react';

export default function TestUtilityPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFreshRecurringClient = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/test/create-fresh-recurring', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create client');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cleanupAllTestClients = async () => {
    if (!confirm('Are you sure? This will delete ALL test clients. This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/test/cleanup-clients', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || 'Failed to cleanup');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
    }}>
      <h1 style={{ marginTop: 0 }}>Test Utility - Create Test Clients</h1>

      <section style={{
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '6px',
        border: '1px solid #ddd'
      }}>
        <h2>Create Fresh Recurring Client</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Creates a new recurring client in "recurring_client" status, ready to book a session.
        </p>
        <button
          onClick={createFreshRecurringClient}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#4a6741',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating...' : 'Create Fresh Recurring Client'}
        </button>
      </section>

      <section style={{
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '6px',
        border: '1px solid #ddd'
      }}>
        <h2>Cleanup Test Clients</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Deletes all test clients (those with names starting with "Test Recurring").
        </p>
        <button
          onClick={cleanupAllTestClients}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#c75c5c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Cleaning...' : 'Cleanup All Test Clients'}
        </button>
      </section>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fee',
          border: '1px solid #c75c5c',
          borderRadius: '4px',
          color: '#c75c5c',
          marginBottom: '20px',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#efe',
          border: '1px solid #4a6741',
          borderRadius: '4px',
          color: '#4a6741',
          marginBottom: '20px',
        }}>
          <strong>Success!</strong> {result.message}
          {result.client && (
            <div style={{ marginTop: '10px', fontSize: '14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result.client, null, 2)}
            </div>
          )}
          {result.deletedCount && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Deleted {result.deletedCount} test client{result.deletedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#666',
        lineHeight: '1.6',
      }}>
        <strong>How to use:</strong>
        <ol>
          <li>Click "Create Fresh Recurring Client" to create a test recurring client</li>
          <li>Go to Clients list and find the new client</li>
          <li>Click "Book Session" to test the booking flow</li>
          <li>After booking, "Verify Payment" button will appear</li>
          <li>Click "Verify Payment" to test payment verification</li>
          <li>Use "Cleanup All Test Clients" when done testing</li>
        </ol>
      </div>
    </div>
  );
}
