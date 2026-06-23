'use client';

import React, { useState } from 'react';
import AssessmentEntryModal from './AssessmentEntryModal';
import PaymentVerificationModal from './PaymentVerificationModal';
import TherapistSelectionModal from './TherapistSelectionModal';
import BookingCalendarModal from './BookingCalendarModal';

interface ClientActionButtonProps {
  clientId: number;
  clientName: string;
  status: string;
  therapistId?: number | null;
  therapistName?: string | null;
  isRecurring: boolean;
  clinicId?: number | null;
  clinicLoading?: boolean;
  onActionComplete: () => Promise<void> | void;
}

interface NextAction {
  label: string;
  type: 'assessment' | 'payment' | 'therapist' | 'booking' | 'cancel' | 'view' | 'none';
}

export default function ClientActionButton({
  clientId,
  clientName,
  status,
  therapistId,
  therapistName,
  isRecurring,
  clinicId,
  clinicLoading = false,
  onActionComplete,
}: ClientActionButtonProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getNextAction = (): NextAction => {
    // Every route has a next action based on current status

    // ========== NEW CLIENTS: PAYMENT COMES FIRST ==========
    // Step 1: New clients must verify payment BEFORE any action (assessment or booking)
    if (!isRecurring && status === 'intake') {
      return {
        label: 'Verify Payment',
        type: 'payment',
      };
    }

    // Step 2: After payment verified, if client chose assessment route, Sama assesses
    // Then reception needs to select the recommended therapist
    if (!isRecurring && status === 'assessment_pending') {
      return {
        label: 'Select Therapist',
        type: 'therapist', // Opens therapist selection modal
      };
    }

    // Step 3: After Sama completes assessment and assigns therapist
    if (!isRecurring && therapistId && status === 'ready_for_booking') {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // Step 3 Alternative: If client chose direct selection (skips assessment)
    if (!isRecurring && therapistId && status === 'payment_verified') {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // Payment has been received, waiting for session booking
    if (therapistId && status === 'payment_pending') {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // ========== RECURRING CLIENTS: SKIP PAYMENT VERIFICATION ==========
    // Recurring clients go straight to booking (no payment check needed)
    if (isRecurring && therapistId && (status === 'ready_for_booking' || status === 'intake')) {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // ========== POST-BOOKING ACTIONS ==========
    // Reschedule or Cancel (within 24hrs of session)
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

  const handleModalSuccess = async () => {
    // Call onActionComplete (which fetches fresh data) before closing the modal
    // This ensures the parent component updates with the new status
    console.log('[ClientActionButton] Modal success - calling onActionComplete');
    try {
      await Promise.resolve(onActionComplete());
      console.log('[ClientActionButton] onActionComplete finished - closing modal');
    } catch (err) {
      console.error('[ClientActionButton] Error during onActionComplete:', err);
    }
    // Close modal after data refresh completes
    setActiveModal(null);
  };

  // Disable button if clinic is loading or clinic ID is not set
  const isDisabled = nextAction.type === 'none' || clinicLoading || !clinicId;

  return (
    <>
      <button
        className={`client-next-action-btn ${!isDisabled ? 'active' : 'disabled'}`}
        onClick={handleActionClick}
        title={clinicLoading ? 'Loading clinic data...' : (clinicId ? `Next action: ${nextAction.label}` : 'Clinic data unavailable')}
        disabled={isDisabled}
      >
        {clinicLoading ? 'Loading...' : nextAction.label}
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
          hasTherapist={therapistId ? true : false}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* Therapist Selection Modal */}
      {activeModal === 'therapist' && (
        <TherapistSelectionModal
          clientId={clientId}
          clientName={clientName}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* Booking Calendar Modal */}
      {activeModal === 'booking' && clinicId && (
        <BookingCalendarModal
          clientId={clientId}
          clientName={clientName}
          therapistId={therapistId || undefined}
          therapistName={therapistName || undefined}
          isRecurring={isRecurring}
          clinicId={clinicId}
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
