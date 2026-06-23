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
  paymentVerified1?: boolean;
  paymentAmount1?: number;
  paymentVerified2?: boolean;
  paymentAmount2?: number;
  totalPaymentDue?: number;
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
  paymentVerified1 = false,
  paymentAmount1,
  paymentVerified2 = false,
  paymentAmount2,
  totalPaymentDue,
  onActionComplete,
}: ClientActionButtonProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getNextAction = (): NextAction => {
    // ========== TWO-TIER PAYMENT SYSTEM ==========
    // Tier 1: Payment for first session (minimum therapist rate = 2000 EGP)
    // Tier 2: Additional payment (difference between therapist rate and tier 1)

    // Step 1: NEW CLIENTS - Verify Payment for first session (before therapist assignment)
    if (status === 'intake' && !paymentVerified1) {
      return {
        label: 'Verify Payment',
        type: 'payment',
      };
    }

    // Step 2: After payment verified, Sama assesses and assigns therapist
    // Reception needs to select the therapist
    if (!isRecurring && status === 'assessment_pending' && !therapistId) {
      return {
        label: 'Select Therapist',
        type: 'therapist',
      };
    }

    // Step 3: After therapist assigned, check if additional payment is needed
    // If therapist rate > initial payment, show "Verify Additional Payment"
    // For old clients: if therapistId is set in assessment_pending, assume initial payment was done
    if (therapistId && status === 'assessment_pending' && (paymentVerified1 || !paymentAmount1)) {
      const minimumFee = paymentAmount1 || 2000; // Default to 2000 if not set (old clients)
      const remainingAmount = (totalPaymentDue || 0) - minimumFee;

      // If therapist rate equals or is less than initial payment, no additional payment needed
      if (remainingAmount <= 0) {
        return {
          label: 'Book Session',
          type: 'booking',
        };
      }

      // If additional payment not verified, show payment verification
      if (!paymentVerified2) {
        return {
          label: 'Verify Additional Payment',
          type: 'payment',
        };
      }

      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // Step 4: Ready for booking after all payments verified
    if (therapistId && status === 'ready_for_booking') {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // RECURRING CLIENTS: Skip initial payment verification, go straight to therapist assignment
    if (isRecurring && status === 'intake' && !therapistId) {
      return {
        label: 'Select Therapist',
        type: 'therapist',
      };
    }

    if (isRecurring && therapistId && status === 'assessment_pending') {
      return {
        label: 'Book Session',
        type: 'booking',
      };
    }

    // RECURRING CLIENTS: Can book directly if therapist assigned and ready
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
      console.log('[ClientActionButton] onActionComplete finished');
      // Wait a bit for React to process the state update
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('[ClientActionButton] Error during onActionComplete:', err);
    }
    // Close modal after data refresh completes
    console.log('[ClientActionButton] Closing modal');
    setActiveModal(null);
  };

  // Disable button only if no valid next action exists
  // Clinic loading is handled by button state; clinicId is optional for most actions
  const isDisabled = nextAction.type === 'none';

  return (
    <>
      <button
        className={`client-next-action-btn ${!isDisabled ? 'active' : 'disabled'}`}
        onClick={handleActionClick}
        title={`Next action: ${nextAction.label}`}
        disabled={isDisabled}
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
      {activeModal === 'payment' && (() => {
        // Determine payment type and amount
        const isAdditionalPayment = therapistId && paymentVerified1 && !paymentVerified2;
        const paymentType = isAdditionalPayment ? 'remaining' : 'assessment';
        const minimumFee = paymentAmount1 || 2000;
        const amount = isAdditionalPayment ? ((totalPaymentDue || 0) - minimumFee) : minimumFee;

        return (
          <PaymentVerificationModal
            clientId={clientId}
            clientName={clientName}
            therapistName={therapistName || undefined}
            paymentType={paymentType}
            amount={amount > 0 ? amount : minimumFee}
            hasTherapist={therapistId ? true : false}
            onSuccess={handleModalSuccess}
            onClose={handleModalClose}
          />
        );
      })()}

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
      {activeModal === 'booking' && clinicId != null && therapistId != null && (
        <BookingCalendarModal
          clientId={clientId}
          clientName={clientName}
          therapistId={therapistId}
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
