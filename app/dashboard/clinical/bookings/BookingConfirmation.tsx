'use client';

import React, { useState } from 'react';
import PaymentInstructions from './PaymentInstructions';
import './booking-confirmation.css';

interface BookingData {
  id?: string;
  client_id: string;
  client_name?: string;
  therapist_id: string;
  therapist_name?: string;
  session_date: string;
  duration_minutes: number;
  session_type: 'single' | 'group' | 'couple';
  room_id?: string;
  room_name?: string;
  notes?: string;
  payment_amount?: number;
  payment_deadline?: string;
}

interface BookingConfirmationProps {
  booking: BookingData;
  onConfirm: (bookingData: BookingData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export default function BookingConfirmation({
  booking,
  onConfirm,
  onCancel,
  loading = false,
  error = '',
}: BookingConfirmationProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [confirmError, setConfirmError] = useState(error);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format session type display
  const formatSessionType = (type: string) => {
    const sessionTypes: Record<string, string> = {
      single: 'Individual Session',
      group: 'Group Session',
      couple: 'Couple Session',
    };
    return sessionTypes[type] || type;
  };

  // Handle confirm booking
  const handleConfirm = async () => {
    try {
      setConfirmError('');
      await onConfirm(booking);
      setShowPaymentInstructions(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm booking';
      setConfirmError(errorMessage);
    }
  };

  // Handle cancel request
  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  // Confirm cancellation
  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  // Calculate payment deadline info
  const getPaymentDeadlineInfo = () => {
    if (!booking.payment_deadline) return null;

    const now = new Date();
    const deadline = new Date(booking.payment_deadline);
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        text: 'Payment deadline passed',
        status: 'overdue',
      };
    }

    const hours = Math.ceil(diff / (1000 * 60 * 60));
    if (hours <= 24) {
      return {
        text: `${hours} hour${hours !== 1 ? "s" : ""} remaining`,
        status: 'urgent',
      };
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return {
      text: `${days} day${days !== 1 ? "s" : ""} to pay`,
      status: 'pending',
    };
  };

  const deadlineInfo = getPaymentDeadlineInfo();

  // If payment instructions are being shown, display that instead
  if (showPaymentInstructions) {
    return (
      <div className="booking-confirmation-container">
        <div className="booking-confirmation-header">
          <h2 className="booking-confirmation-title">Booking Confirmed!</h2>
          <p className="booking-confirmation-subtitle">
            Your booking has been successfully created. Here are your payment instructions:
          </p>
        </div>

        <PaymentInstructions
          bookingId={booking.id || 'N/A'}
          clientName={booking.client_name || 'Client'}
          amount={booking.payment_amount || 2000}
          deadline={booking.payment_deadline || new Date().toISOString()}
          sessionDate={booking.session_date}
          showCopyButtons={true}
          showPrintButton={true}
        />

        <div className="booking-confirmation-actions">
          <button
            className="booking-confirmation-button booking-confirmation-button--secondary"
            onClick={() => setShowPaymentInstructions(false)}
          >
            Back to Summary
          </button>
          <button
            className="booking-confirmation-button booking-confirmation-button--primary"
            onClick={onCancel}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="booking-confirmation-container">
        {/* Header */}
        <div className="booking-confirmation-header">
          <h2 className="booking-confirmation-title">Confirm Booking</h2>
          <p className="booking-confirmation-subtitle">
            Please review the booking details below before confirming.
          </p>
        </div>

        {/* Error message */}
        {confirmError && (
          <div className="booking-confirmation-error">
            <span className="booking-confirmation-error__icon">⚠️</span>
            <span className="booking-confirmation-error__text">{confirmError}</span>
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="booking-summary-card">
          <div className="booking-summary-section">
            <h3 className="booking-summary-section__title">Client Information</h3>
            <div className="booking-summary-grid">
              <div className="booking-summary-item">
                <label className="booking-summary-label">Client Name</label>
                <p className="booking-summary-value">{booking.client_name || 'N/A'}</p>
              </div>
              <div className="booking-summary-item">
                <label className="booking-summary-label">Client ID</label>
                <p className="booking-summary-value booking-summary-value--mono">{booking.client_id}</p>
              </div>
            </div>
          </div>

          <div className="booking-summary-divider"></div>

          <div className="booking-summary-section">
            <h3 className="booking-summary-section__title">Session Details</h3>
            <div className="booking-summary-grid">
              <div className="booking-summary-item">
                <label className="booking-summary-label">Therapist</label>
                <p className="booking-summary-value">{booking.therapist_name || 'N/A'}</p>
              </div>
              <div className="booking-summary-item">
                <label className="booking-summary-label">Session Type</label>
                <p className="booking-summary-value">{formatSessionType(booking.session_type)}</p>
              </div>
              <div className="booking-summary-item">
                <label className="booking-summary-label">Date & Time</label>
                <p className="booking-summary-value">{formatDate(booking.session_date)}</p>
              </div>
              <div className="booking-summary-item">
                <label className="booking-summary-label">Duration</label>
                <p className="booking-summary-value">{booking.duration_minutes} minutes</p>
              </div>
              {booking.room_name && (
                <div className="booking-summary-item">
                  <label className="booking-summary-label">Room</label>
                  <p className="booking-summary-value">{booking.room_name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="booking-summary-divider"></div>

          <div className="booking-summary-section">
            <h3 className="booking-summary-section__title">Payment Information</h3>
            <div className="booking-summary-grid">
              <div className="booking-summary-item">
                <label className="booking-summary-label">Amount Due</label>
                <p className="booking-summary-value booking-summary-value--highlight">
                  {booking.payment_amount || 2000} EGP
                </p>
              </div>
              <div className="booking-summary-item">
                <label className="booking-summary-label">Payment Deadline</label>
                <p className="booking-summary-value">{formatDate(booking.payment_deadline || new Date().toISOString())}</p>
              </div>
              {deadlineInfo && (
                <div className="booking-summary-item">
                  <label className="booking-summary-label">Status</label>
                  <p className={`booking-summary-value booking-summary-value--${deadlineInfo.status}`}>
                    {deadlineInfo.text}
                  </p>
                </div>
              )}
            </div>
          </div>

          {booking.notes && (
            <>
              <div className="booking-summary-divider"></div>
              <div className="booking-summary-section">
                <h3 className="booking-summary-section__title">Notes</h3>
                <p className="booking-summary-notes">{booking.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="booking-confirmation-actions">
          <button
            className="booking-confirmation-button booking-confirmation-button--secondary"
            onClick={handleCancelRequest}
            disabled={loading}
          >
            Cancel Booking
          </button>
          <button
            className="booking-confirmation-button booking-confirmation-button--primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>

        {/* Info Message */}
        <div className="booking-confirmation-info">
          <span className="booking-confirmation-info__icon">ℹ️</span>
          <span className="booking-confirmation-info__text">
            Payment must be received within 24 hours to secure this booking.
          </span>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="booking-confirmation-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div
            className="booking-confirmation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-confirmation-modal-header">
              <h3 className="booking-confirmation-modal-title">Cancel Booking?</h3>
              <button
                className="booking-confirmation-modal-close"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="booking-confirmation-modal-content">
              <p>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>

            <div className="booking-confirmation-modal-footer">
              <button
                className="booking-confirmation-button booking-confirmation-button--secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
              <button
                className="booking-confirmation-button booking-confirmation-button--danger"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
