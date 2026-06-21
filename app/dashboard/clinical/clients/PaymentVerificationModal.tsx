'use client';

import React, { useState } from 'react';
import './modal.css';

interface PaymentVerificationModalProps {
  clientId: number;
  clientName: string;
  hasTherapist?: boolean; // true if therapist already assigned (direct selection)
  amount?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentVerificationModal({
  clientId,
  clientName,
  hasTherapist = false,
  amount,
  onSuccess,
  onClose,
}: PaymentVerificationModalProps) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!paymentDate) {
      setError('Please select the transfer date');
      return;
    }

    setLoading(true);

    try {
      // Determine next status based on whether therapist is already assigned
      const nextStatus = hasTherapist ? 'ready_for_booking' : 'assessment_pending';

      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: nextStatus,
          payment_verified: true,
          payment_date: paymentDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify payment');
      }

      setSuccess(true);
      // Wait 2 seconds to show success message and allow data refresh to complete
      // Then close modal so user sees updated Next Action
      setTimeout(() => {
        onSuccess(); // Triggers fetchClients on parent
        onClose();   // Close modal after refetch is initiated
      }, 2000);
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
            <h2 className="modal-success-title">Payment Verified ✓</h2>
            <p className="modal-success-message">
              {hasTherapist
                ? `Payment from ${clientName} confirmed. They can now proceed to book their session.`
                : `Payment from ${clientName} confirmed. Awaiting assessment from Sama to assign a therapist.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Payment - {clientName}</h2>
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

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-info-box">
            <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#556277' }}>
              Payment received via InstaPay or Bank Transfer. Confirm the transfer date to complete payment verification.
            </p>
          </div>

          <div className="modal-form-group">
            <label htmlFor="paymentDate" className="modal-label">
              Transfer Date <span className="modal-required">*</span>
            </label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="modal-input"
              required
            />
          </div>

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
              type="submit"
              className="modal-btn modal-btn--primary"
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
