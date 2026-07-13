'use client';

/**
 * PaymentVerificationModal - Handles all payment verification for clients
 *
 * PAYMENT TYPES (controlled by paymentType prop):
 *
 * 1. 'assessment' - First payment (Tier 1)
 *    - Amount: Minimum 2000 EGP
 *    - Updates: payment_verified_1, payment_amount_1, payment_date_1, total_amount_paid
 *    - Status transition: 'intake' → 'assessment_pending'
 *    - Used for: All new clients at intake stage
 *
 * 2. 'remaining' - Additional payment (Tier 2)
 *    - Amount: therapist_rate - 2000 (only if therapist rate > 2000)
 *    - Updates: payment_verified_2, payment_amount_2, payment_date_2, total_amount_paid
 *    - Status transition: 'assessment_pending' → 'ready_for_booking'
 *    - Used for: Clients with therapist assigned who need to pay difference
 *
 * 3. 'session' - Session payment (Recurring clients only)
 *    - Amount: therapist hourly rate (from booking context)
 *    - Updates: session_payment_received, session_payment_date, session_payment_amount, total_amount_paid
 *    - Status transition: None (remains 'booking_scheduled')
 *    - Used for: Recurring clients verifying payment for each booked session
 *    - Creates: payment_history record for audit trail
 *
 * See: docs/PAYMENT_FIELDS_DOCUMENTATION.md for complete payment flow
 */

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  // Get React Query client to invalidate caches after mutations
  const queryClient = useQueryClient();

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

        // Also update the booking's payment status to 'paid'
        console.log('[PaymentVerificationModal] Updating booking payment status for booking:', bookingId);
        const bookingUpdateRes = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            payment_status: 'paid',
          }),
        });

        if (!bookingUpdateRes.ok) {
          const bookingError = await bookingUpdateRes.json();
          console.warn('[PaymentVerificationModal] Failed to update booking payment status:', bookingError);
          // Don't fail the flow if booking update fails
        } else {
          console.log('[PaymentVerificationModal] Booking payment status updated to paid');
        }
      } else if (paymentType === 'assessment') {
        // Initial payment for first session booking (minimum therapist rate)
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
        const assessmentAmount = amount || 2000;

        console.log('[PaymentVerificationModal] Assessment payment - Current total_amount_paid:', currentTotal);
        console.log('[PaymentVerificationModal] Assessment payment - Amount:', assessmentAmount);
        console.log('[PaymentVerificationModal] Assessment payment - New total will be:', currentTotal + assessmentAmount);

        updateData.payment_verified_1 = true;
        updateData.payment_date_1 = paymentDate;
        updateData.payment_amount_1 = assessmentAmount; // Use calculated amount
        updateData.total_amount_paid = currentTotal + assessmentAmount; // ✅ ADD TO TOTAL
        // Status transition only for non-recurring clients
        // Recurring clients stay in booking_scheduled until session starts (auto-transition at 24hr mark)
        if (!isRecurring) {
          updateData.status = 'assessment_pending';
        }
      } else {
        // Remaining payment after therapist assigned (if therapist rate > initial payment)
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
        const remainingAmount = amount || 0;

        console.log('[PaymentVerificationModal] Remaining payment - Current total_amount_paid:', currentTotal);
        console.log('[PaymentVerificationModal] Remaining payment - Amount:', remainingAmount);
        console.log('[PaymentVerificationModal] Remaining payment - New total will be:', currentTotal + remainingAmount);

        updateData.payment_verified_2 = true;
        updateData.payment_date_2 = paymentDate;
        updateData.payment_amount_2 = remainingAmount;
        updateData.total_amount_paid = currentTotal + remainingAmount; // ✅ ADD TO TOTAL
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

      // Create payment record for audit trail
      const paymentAmount = paymentType === 'session' ? (amount || 2000) : (amount || 2000);
      console.log('[PaymentVerificationModal] Creating payment record - Amount:', paymentAmount, 'Date:', paymentDate);

      const recordRes = await fetch('/api/admin/payment-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          payment_date: paymentDate,
          amount_paid: paymentAmount,
          actual_cost: paymentAmount,
          refund_amount: 0,
          additional_charge: 0,
          charge_status: 'completed',
        }),
      });

      if (!recordRes.ok) {
        const recordError = await recordRes.json();
        console.warn('[PaymentVerificationModal] Failed to create payment record:', recordError);
        // Don't fail the entire flow if record creation fails
      } else {
        console.log('[PaymentVerificationModal] Payment record created successfully');
      }

      // Invalidate React Query caches so ClientProfile refetches the updated data
      console.log('[PaymentVerificationModal] Invalidating React Query caches for client:', clientId);
      await queryClient.invalidateQueries({
        queryKey: ['client', clientId]
      });
      console.log('[PaymentVerificationModal] React Query caches invalidated - queries will refetch');

      setSuccess(true);
      // Wait 2 seconds to show success message, then trigger parent refresh and close modal
      setTimeout(async () => {
        console.log('[PaymentVerificationModal] Success timeout - calling onSuccess to close modal and refresh parent');
        try {
          const result = onSuccess();
          // Properly await the Promise if returned
          if (result && typeof result.then === 'function') {
            console.log('[PaymentVerificationModal] onSuccess returned a Promise, awaiting...');
            await result;
            console.log('[PaymentVerificationModal] onSuccess Promise completed');
          }
          console.log('[PaymentVerificationModal] onSuccess finished, modal should close');
        } catch (err) {
          console.error('[PaymentVerificationModal] onSuccess threw error:', err);
        }
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
