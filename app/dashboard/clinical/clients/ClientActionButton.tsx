'use client';

import React, { useState } from 'react';
import AssessmentEntryModal from './AssessmentEntryModal';
import PaymentVerificationModal from './PaymentVerificationModal';
import BookingCalendarModal from './BookingCalendarModal';

interface ClientActionButtonProps {
  clientId: number;
  clientName: string;
  status: string;
  therapistId?: number;
  therapistName?: string | null;
  isRecurring: boolean;
  onActionComplete: () => void;
}

interface NextAction {
  label: string;
  type: 'assessment' | 'payment' | 'booking' | 'cancel' | 'view' | 'none';
  color: string;
}

export default function ClientActionButton({
  clientId,
  clientName,
  status,
  therapistId,
  therapistName,
  isRecurring,
  onActionComplete,
}: ClientActionButtonProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getNextAction = (): NextAction => {
    // New clients need therapist assignment first
    if (!isRecurring && !therapistId && (status === 'intake' || status === 'assessment_pending')) {
      return {
        label: 'Assign Therapist',
        type: 'assessment',
        color: '#d4a574', // warning/secondary color
      };
    }

    // New clients need payment verification after therapist assignment
    if (!isRecurring && therapistId && status === 'ready_for_booking') {
      return {
        label: 'Verify Payment',
        type: 'payment',
        color: '#c75c5c', // error/warning color
      };
    }

    // Recurring clients go straight to booking
    if (isRecurring && therapistId && (status === 'ready_for_booking' || status === 'intake')) {
      return {
        label: 'Book Session',
        type: 'booking',
        color: '#6b8e6f', // success color
      };
    }

    // Payment pending - new clients waiting for payment
    if (status === 'payment_pending') {
      return {
        label: 'Verify Payment',
        type: 'payment',
        color: '#c75c5c',
      };
    }

    // Booked sessions can be cancelled/rescheduled
    if (status === 'booking_scheduled') {
      return {
        label: 'Cancel/Reschedule',
        type: 'cancel',
        color: '#666666',
      };
    }

    // Active sessions
    if (status === 'active') {
      return {
        label: 'View Session',
        type: 'view',
        color: '#8b6a4f',
      };
    }

    // Completed/inactive
    if (status === 'completed' || status === 'inactive') {
      return {
        label: 'View History',
        type: 'view',
        color: '#999999',
      };
    }

    return {
      label: 'No Action',
      type: 'none',
      color: '#999999',
    };
  };

  const nextAction = getNextAction();

  const handleActionClick = () => {
    if (nextAction.type === 'none') return;
    setActiveModal(nextAction.type);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleModalSuccess = () => {
    setActiveModal(null);
    onActionComplete();
  };

  return (
    <>
      <button
        className="client-next-action-btn"
        style={{
          backgroundColor: nextAction.color,
          opacity: nextAction.type === 'none' ? 0.5 : 1,
          cursor: nextAction.type === 'none' ? 'default' : 'pointer',
        }}
        onClick={handleActionClick}
        title={`Next action: ${nextAction.label}`}
        disabled={nextAction.type === 'none'}
      >
        {nextAction.label}
      </button>

      {/* Assessment Entry Modal */}
      {activeModal === 'assessment' && (
        <AssessmentEntryModal
          clientId={clientId}
          clientName={clientName}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* Payment Verification Modal */}
      {activeModal === 'payment' && (
        <PaymentVerificationModal
          clientId={clientId}
          clientName={clientName}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* Booking Calendar Modal */}
      {activeModal === 'booking' && (
        <BookingCalendarModal
          clientId={clientId}
          clientName={clientName}
          therapistId={therapistId}
          therapistName={therapistName || undefined}
          isRecurring={isRecurring}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* View/Cancel - TODO: Implement these modals */}
      {/* {activeModal === 'cancel' && (
        <CancelRescheduleModal
          clientId={clientId}
          clientName={clientName}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {activeModal === 'view' && (
        <ViewModal
          clientId={clientId}
          clientName={clientName}
          onClose={handleModalClose}
        />
      )} */}
    </>
  );
}
