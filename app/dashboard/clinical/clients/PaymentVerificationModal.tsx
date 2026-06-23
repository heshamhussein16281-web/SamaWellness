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
        // Initial assessment payment (before therapist assignment)
        updateData.assessment_payment_verified = true;
        updateData.assessment_payment_date = paymentDate;
        updateData.assessment_payment_amount = amount || 2000; // Default to minimum (2000 EGP)
        // After assessment payment, move to assessment pending (Sama will assess)
        updateData.status = 'assessment_pending';
      } else {
        // Remaining therapist fee payment (after therapist assigned)
        updateData.therapist_fee_payment_verified = true;
        updateData.therapist_fee_payment_date = paymentDate;
        updateData.therapist_fee_payment_amount = amount;
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
      setTimeout(async () => {
        await Promise.resolve(onSuccess()); // Triggers fetchClients on parent and waits for it
        // Note: onClose will be called after onSuccess completes its async work
        // because handleModalSuccess in parent awaits the data refresh
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
                ? `Assessment payment (${amount || 2000} EGP) from ${clientName} confirmed. Awaiting assessment from Sama to assign a therapist.`
                : `Remaining payment (${amount} EGP) from ${clientName} for ${therapistName || 'their therapist'} confirmed. They can now proceed to book their session.`}
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
              ? `Confirm Assessment Payment - ${clientName}`
              : `Confirm Remaining Payment - ${clientName}`}
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
                ? `Assessment Payment: ${amount || 2000} EGP. Payment received via InstaPay or Bank Transfer. Confirm the transfer date to complete payment verification.`
                : `Remaining Payment: ${amount} EGP for ${therapistName || 'assigned therapist'}. Payment received via InstaPay or Bank Transfer. Confirm the transfer date to complete payment verification.`}
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
