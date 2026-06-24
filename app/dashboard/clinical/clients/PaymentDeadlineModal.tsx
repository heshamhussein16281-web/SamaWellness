'use client';

import React, { useState } from 'react';
import './modal.css';

interface PaymentDeadlineModalProps {
  clientId: number;
  clientName: string;
  bookingId: number;
  sessionDate: string;
  therapistName?: string;
  hoursRemaining: number;
  paymentAmount?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentDeadlineModal({
  clientId,
  clientName,
  bookingId,
  sessionDate,
  therapistName,
  hoursRemaining,
  paymentAmount = 0,
  onSuccess,
  onClose,
}: PaymentDeadlineModalProps) {
  const [action, setAction] = useState<'pay' | 'cancel' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePay = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payment_verified_1: true,
          payment_date_1: new Date().toISOString().split('T')[0],
          payment_amount_1: paymentAmount || 3000,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify payment');
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

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: `Late payment cancellation: ${cancelReason.trim()}`,
          refund_requested: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel booking');
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
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">
              {action === 'pay' ? 'Payment Confirmed' : 'Booking Cancelled'}
            </h2>
            <p className="modal-success-message">
              {action === 'pay'
                ? `Payment verified. Your session with ${therapistName} on ${formatDate(sessionDate)} is confirmed.`
                : `Booking cancelled. Refund will be processed. Slot is now available for other clients.`}
            </p>
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
            <h2 className="modal-title">⚠️ Payment Deadline</h2>
            <p className="modal-subtitle">
              {Math.round(hoursRemaining)} hours remaining before your session
            </p>
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

        {/* Info Box */}
        <div
          style={{
            padding: '1.5rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            margin: '1rem',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#856404' }}>
            📋 Session Details
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem', color: '#333' }}>
            <strong>{clientName}</strong> with {therapistName}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.95rem', color: '#333' }}>
            {formatDate(sessionDate)}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
            Payment Amount: <strong>{paymentAmount || 3000} EGP</strong>
          </p>
        </div>

        {action === null ? (
          <>
            <p style={{ margin: '0 1rem 1.5rem 1rem', color: '#666', fontSize: '0.95rem' }}>
              Your payment is overdue. Please confirm payment within the next{' '}
              <strong>{Math.round(hoursRemaining)} hours</strong> to keep your booking, or cancel to free
              up the slot for others.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '0 1rem 1.5rem 1rem',
              }}
            >
              {/* Pay Button */}
              <button
                onClick={() => setAction('pay')}
                style={{
                  padding: '1.5rem',
                  border: '2px solid #4a6741',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e7f8e8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f0fdf4')}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💳</div>
                <div style={{ fontWeight: '600', color: '#333' }}>Confirm Payment</div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Secure your session
                </div>
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setAction('cancel')}
                style={{
                  padding: '1.5rem',
                  border: '2px solid #c75c5c',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fde8e8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✕</div>
                <div style={{ fontWeight: '600', color: '#333' }}>Cancel Booking</div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Release slot for others
                </div>
              </button>
            </div>
          </>
        ) : action === 'pay' ? (
          <>
            <div
              style={{
                padding: '1.5rem',
                background: '#f0fdf4',
                borderLeft: '4px solid #4a6741',
                borderRadius: '6px',
                margin: '0 1rem 1.5rem 1rem',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#4a6741' }}>
                ✓ Confirm Payment
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
                Payment of <strong>{paymentAmount || 3000} EGP</strong> has been received. Click below to
                confirm and keep your booking active.
              </p>
            </div>

            <div style={{ padding: '0 1rem 1.5rem 1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  setAction(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? 'Confirming...' : 'Confirm Payment'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: '1.5rem',
                background: '#fef2f2',
                borderLeft: '4px solid #c75c5c',
                borderRadius: '6px',
                margin: '0 1rem 1.5rem 1rem',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#c75c5c' }}>
                ⚠️ Cancel Booking
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#333' }}>
                This will release the slot for other clients. A refund of <strong>{paymentAmount || 3000} EGP</strong> will
                be processed.
              </p>
            </div>

            <div className="modal-form-group" style={{ margin: '0 1rem' }}>
              <label className="modal-label">Reason for Cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="modal-input"
                placeholder="Why are you cancelling this booking?"
                style={{ minHeight: '80px', fontFamily: 'inherit' }}
                disabled={loading}
              />
            </div>

            <div style={{ padding: '0 1rem 1.5rem 1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  setAction(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handleCancel}
                disabled={loading || !cancelReason.trim()}
              >
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
