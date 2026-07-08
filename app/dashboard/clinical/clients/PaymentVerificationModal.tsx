'use client';

import React, { useState } from 'react';
import './modal.css';

interface PaymentVerificationModalProps {
  clientId: number;
  clientName: string;
  hasTherapist?: boolean; // true if therapist already assigned (direct selection)
  therapistName?: string; // name of assigned therapist
  paymentType?: 'assessment' | 'remaining' | 'session'; // 'assessment' for initial, 'remaining' for therapist fee, 'session' for recurring client session
  amount?: number;
  isRecurring?: boolean; // true if client is recurring (affects status transitions)
  bookingId?: number; // booking ID for session payment (when paymentType is 'session')
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
  isRecurring = false,
  bookingId,
  onSuccess,
  onClose,
}: PaymentVerificationModalProps) {
  // Helper to format date as YYYY-MM-DD using local components (not UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [paymentDate, setPaymentDate] = useState(formatLocalDate(new Date()));
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

      // Debug: Log the payment type detection logic
      console.log('[PaymentVerificationModal] handleSubmit - Payment Type Evaluation:', {
        paymentType,
        bookingId,
        isRecurring,
        checkResult: paymentType === 'session' && bookingId ? 'WILL USE SESSION PAYMENT' : 'WILL NOT USE SESSION PAYMENT (FALLBACK TO OTHER)',
      });

      if (paymentType === 'session' && bookingId) {
        // Session payment for recurring clients (after booking a session)
        console.log('[PaymentVerificationModal] Recording session payment for booking:', bookingId);

        // Fetch current client to get existing total_amount_paid
        const currentClientRes = await fetch(`/api/admin/clients/${clientId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!currentClientRes.ok) {
          throw new Error('Failed to fetch current client data');
        }

        const currentClientData = await currentClientRes.json();
        const currentTotal = currentClientData.data?.total_amount_paid || 0;
        const sessionAmount = amount || 2000;

        console.log('[PaymentVerificationModal] Current total_amount_paid:', currentTotal);
        console.log('[PaymentVerificationModal] Session amount:', sessionAmount);
        console.log('[PaymentVerificationModal] New total will be:', currentTotal + sessionAmount);

        updateData.session_payment_received = true;
        updateData.session_payment_date = paymentDate;
        updateData.session_payment_amount = sessionAmount;
        updateData.total_amount_paid = currentTotal + sessionAmount;
      } else if (paymentType === 'assessment') {
        // Initial payment for first session booking (minimum therapist rate)
        updateData.payment_verified_1 = true;
        updateData.payment_date_1 = paymentDate;
        updateData.payment_amount_1 = amount || 2000; // Default to minimum (2000 EGP)
        // Status transition only for non-recurring clients
        // Recurring clients stay in booking_scheduled until session starts (auto-transition at 24hr mark)
        if (!isRecurring) {
          updateData.status = 'assessment_pending';
        }
      } else {
        // Remaining payment after therapist assigned (if therapist rate > initial payment)
        updateData.payment_verified_2 = true;
        updateData.payment_date_2 = paymentDate;
        updateData.payment_amount_2 = amount;
        // After remaining payment, ready for booking
        updateData.status = 'ready_for_booking';
      }

      console.log('[PaymentVerificationModal] Sending payment verification for client:', clientId);
      console.log('[PaymentVerificationModal] Recurring client:', isRecurring);
      console.log('[PaymentVerificationModal] Update data:', updateData);
      console.log('[PaymentVerificationModal] Status will change:', 'status' in updateData ? updateData.status : 'NO (not included in update)');

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
