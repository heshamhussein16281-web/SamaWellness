'use client';

import React, { useState } from 'react';
import './modal.css';

interface PaymentVerificationModalProps {
  clientId: number;
  clientName: string;
  hasTherapist?: boolean; // true if therapist already assigned (direct selection)
  therapistName?: string; // name of assigned therapist
  paymentType?: 'assessment' | 'remaining'; // 'assessment' for initial, 'remaining' for therapist fee difference
  amount?: number;
  onSuccess: () => Promise<void> | void;
  onClose: () => void;
}

export default function PaymentVerificationModal({
  clientId,
  clientName,
  hasTherapist = false,
  therapistName,
  paymentType = 'assessment',
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
      // Build update object based on payment type
      const updateData: any = {};

      if (paymentType === 'assessment') {
        // Initial payment for first session booking (minimum therapist rate)
        updateData.payment_verified_1 = true;
        updateData.payment_date_1 = paymentDate;
        updateData.payment_amount_1 = amount || 2000; // Default to minimum (2000 EGP)
        // After payment, move to assessment pending (Sama will assess and assign therapist)
        updateData.status = 'assessment_pending';
      } else {
        // Remaining payment after therapist assigned (if therapist rate > initial payment)
        updateData.payment_verified_2 = true;
        updateData.payment_date_2 = paymentDate;
        updateData.payment_amount_2 = amount;
        // After remaining payment, ready for booking
        updateData.status = 'ready_for_booking';
      }

      console.log('[PaymentVerificationModal] Sending payment verification for client:', clientId);
      console.log('[PaymentVerificationModal] Update data:', updateData);

      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      console.log('[PaymentVerificationModal] API response status:', res.status);

      if (!res.ok) {
        const data = await res.json();
        console.error('[PaymentVerificationModal] API error:', res.status, data);
        throw new Error(data.details || data.error || 'Failed to verify payment');
      }

      const responseData = await res.json();
      console.log('[PaymentVerificationModal] API success response:', responseData);

      setSuccess(true);
      // Wait 1.5 seconds to show success message, then trigger parent refresh
      setTimeout(() => {
        console.log('[PaymentVerificationModal] Calling onSuccess after success state');
        try {
          const result = onSuccess();
          // If onSuccess returns a Promise, log it (but don't need to await in setTimeout)
          if (result && typeof result.then === 'function') {
            console.log('[PaymentVerificationModal] onSuccess returned a Promise');
            result.catch((err) => {
              console.error('[PaymentVerificationModal] onSuccess Promise rejected:', err);
            });
          }
        } catch (err) {
          console.error('[PaymentVerificationModal] onSuccess threw error:', err);
        }
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
            <h2 className="modal-success-title">Payment Verified ✓</h2>
            <p className="modal-success-message">
              {paymentType === 'assessment'
                ? `Payment (${amount || 2000} EGP) from ${clientName} confirmed. They will now have a session with Sama to help select a therapist.`
                : `Additional payment (${amount} EGP) from ${clientName} for ${therapistName || 'their therapist'} confirmed. They can now book sessions.`}
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
          <h2 className="modal-title">
            {paymentType === 'assessment'
              ? `Confirm Payment - ${clientName}`
              : `Confirm Additional Payment - ${clientName}`}
          </h2>
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
              {paymentType === 'assessment'
                ? `Payment: ${amount || 2000} EGP for first session booking. Payment received via InstaPay or Bank Transfer. Confirm the transfer date to complete payment verification.`
                : `Additional Payment: ${amount} EGP for ${therapistName || 'assigned therapist'}. Payment received via InstaPay or Bank Transfer. Confirm the transfer date to complete payment verification.`}
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
