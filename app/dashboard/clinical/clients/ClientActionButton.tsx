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
  assessmentPaymentVerified?: boolean;
  assessmentPaymentAmount?: number;
  therapistFeePaymentVerified?: boolean;
  therapistFeePaymentAmount?: number;
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
  assessmentPaymentVerified = false,
  assessmentPaymentAmount,
  therapistFeePaymentVerified = false,
  therapistFeePaymentAmount,
  totalPaymentDue,
  onActionComplete,
}: ClientActionButtonProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const getNextAction = (): NextAction => {
    // ========== TWO-TIER PAYMENT SYSTEM ==========
    // Tier 1: Assessment Payment (minimum therapist rate = 2000 EGP)
    // Tier 2: Therapist Fee Payment (difference between therapist rate and assessment payment)

    // Step 1: NEW CLIENTS - Verify Assessment Payment (before therapist assignment)
    if (status === 'intake' && !assessmentPaymentVerified) {
      return {
        label: 'Verify Assessment Payment',
        type: 'payment',
      };
    }

    // Step 2: After assessment payment verified, Sama assesses and assigns therapist
    // Reception needs to select the therapist
    if (!isRecurring && status === 'assessment_pending' && !therapistId) {
      return {
        label: 'Select Therapist',
        type: 'therapist',
      };
    }

    // Step 3: After therapist assigned, check if remaining payment is needed
    // If therapist rate > assessment payment, show "Verify Remaining Payment"
    if (therapistId && assessmentPaymentVerified && status === 'assessment_pending') {
      const minimumFee = assessmentPaymentAmount || 2000;
      const remainingAmount = (totalPaymentDue || 0) - minimumFee;

      // If therapist rate equals or is less than assessment payment, no remaining payment needed
      if (remainingAmount <= 0) {
        return {
          label: 'Book Session',
          type: 'booking',
        };
      }

      // If remaining payment not verified, show payment verification
      if (!therapistFeePaymentVerified) {
        return {
          label: 'Verify Remaining Payment',
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

    // RECURRING CLIENTS: Skip assessment, go straight to payment verification
    if (isRecurring && status === 'intake' && !assessmentPaymentVerified) {
      return {
        label: 'Verify Payment',
        type: 'payment',
      };
    }

    if (isRecurring && therapistId && assessmentPaymentVerified && status === 'assessment_pending') {
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
        const isRemainingPayment = therapistId && assessmentPaymentVerified && !therapistFeePaymentVerified;
        const paymentType = isRemainingPayment ? 'remaining' : 'assessment';
        const minimumFee = assessmentPaymentAmount || 2000;
        const amount = isRemainingPayment ? ((totalPaymentDue || 0) - minimumFee) : minimumFee;

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
