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
    // Every route has a next action based on current status

    // Step 1: Select Therapist (Assessment or Client Selection)
    if (!therapistId && (status === 'intake' || status === 'assessment_pending')) {
      return {
        label: 'Select Therapist',
        type: 'assessment',
      };
    }

    // Step 2: Verify Payment (New Clients ONLY - blocking requirement)
    if (!isRecurring && therapistId && status === 'ready_for_booking') {
      return {
        label: 'Verify Payment',
        type: 'payment',
      };
    }

    // Step 3: Book Session
    if (therapistId && (status === 'payment_verified' || (isRecurring && status === 'ready_for_booking'))) {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // Step 4: Reschedule or Cancel (within 24hrs of session)
    if (status === 'booking_scheduled') {
      return {
        label: 'Reschedule or Cancel',
        type: 'cancel',
      };
    }

    // View session details
    if (status === 'active') {
      return {
        label: 'View Session',
        type: 'view',
      };
    }

    // View history
    if (status === 'completed' || status === 'inactive') {
      return {
        label: 'View History',
        type: 'view',
      };
    }

    // Fallback (should rarely occur)
    return {
      label: 'No Action',
      type: 'none',
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
        className={`client-next-action-btn ${nextAction.type !== 'none' ? 'active' : 'disabled'}`}
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
