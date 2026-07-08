'use client';

import React, { useState, useEffect } from 'react';
import AssessmentEntryModal from './AssessmentEntryModal';
import PaymentVerificationModal from './PaymentVerificationModal';
import TherapistSelectionModal from './TherapistSelectionModal';
import BookingCalendarModal from './BookingCalendarModal';
import CompleteSessionModal from './CompleteSessionModal';
import SessionTracker from './SessionTracker';
import RescheduleModal from './RescheduleModal';
import PaymentDeadlineModal from './PaymentDeadlineModal';

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
  paymentAmount1?: number | null;
  paymentVerified2?: boolean;
  paymentAmount2?: number | null;
  totalPaymentDue?: number | null;
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
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showPaymentDeadline, setShowPaymentDeadline] = useState(false);

  // Auto-transition booking_scheduled to active if within 24 hours of session
  // (Only for non-recurring clients - recurring clients have payment verification until 24hrs)
  useEffect(() => {
    if (!isRecurring && status === 'booking_scheduled' && currentBooking?.session_date) {
      const sessionTime = new Date(currentBooking.session_date).getTime();
      const now = new Date().getTime();
      const hoursUntilSession = (sessionTime - now) / (1000 * 60 * 60);

      // If within 24 hours of session, auto-transition to active
      if (hoursUntilSession <= 24) {
        console.log('[ClientActionButton] Session within 24 hours, auto-transitioning to active');
        transitionToActive();
      }
    }
  }, [status, currentBooking?.session_date, isRecurring]);

  const transitionToActive = async () => {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'active',
        }),
      });

      if (res.ok) {
        console.log('[ClientActionButton] Successfully transitioned to active');
        // Trigger parent refresh to update status
        await Promise.resolve(onActionComplete());
      }
    } catch (err) {
      console.error('[ClientActionButton] Error auto-transitioning to active:', err);
    }
  };

  // Fetch booking on mount or when client changes to check 24-hour transition rule
  useEffect(() => {
    if ((status === 'booking_scheduled' || isRecurring) && !currentBooking) {
      fetchCurrentBooking();
    }
  }, [clientId, status, isRecurring]);

  // Check for recurring clients with unpaid sessions within 24 hours
  useEffect(() => {
    if (
      isRecurring &&
      status === 'booking_scheduled' &&
      !paymentVerified1 &&
      currentBooking?.session_date
    ) {
      const sessionTime = new Date(currentBooking.session_date).getTime();
      const now = new Date().getTime();
      const hoursUntilSession = (sessionTime - now) / (1000 * 60 * 60);

      // Show payment deadline modal if within 24 hours and not yet paid
      if (hoursUntilSession <= 24 && hoursUntilSession > 0) {
        console.log('[ClientActionButton] Recurring client payment deadline approaching:', hoursUntilSession);
        setShowPaymentDeadline(true);
      }
    }
  }, [isRecurring, status, paymentVerified1, currentBooking?.session_date]);

  // Fetch current/active booking when view modal is triggered
  // Clear booking when modal closes or client changes
  useEffect(() => {
    if (!activeModal) {
      setCurrentBooking(null);
    }
  }, [activeModal]);

  // Fetch booking when modal is opened
  useEffect(() => {
    if ((activeModal === 'view' || activeModal === 'cancel' || activeModal === 'payment') && !currentBooking) {
      fetchCurrentBooking();
    }
  }, [activeModal, status, currentBooking]);

  const fetchCurrentBooking = async () => {
    setLoadingBooking(true);
    try {
      console.log('[ClientActionButton] Fetching booking for client:', clientId, 'status:', status);

      // Check if there's a recently created booking from a reschedule
      const lastCreatedBookingId = sessionStorage.getItem('lastCreatedBookingId');
      if (lastCreatedBookingId) {
        console.log('[ClientActionButton] Found recently created booking ID:', lastCreatedBookingId);
        // Don't clear yet - keep it for the refresh call later

        // Fetch all bookings and find the one with this ID
        const recentRes = await fetch(`/api/admin/clients/${clientId}/bookings`, { credentials: 'include' });
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          const recentBooking = recentData.data?.find((b: any) => b.id === parseInt(lastCreatedBookingId));
          if (recentBooking && recentBooking.booking_status !== 'cancelled') {
            console.log('[ClientActionButton] Setting current booking to recently created booking:', recentBooking);
            setCurrentBooking(recentBooking);
            setLoadingBooking(false);
            return; // Exit early, don't do the normal fetch
          }
        }
      }

      // First, try to fetch with status filter based on client status
      let statusFilter: string | null = null;
      if (status === 'booking_scheduled') {
        statusFilter = 'scheduled'; // booking_scheduled clients have scheduled bookings
      } else if (status === 'active') {
        statusFilter = 'scheduled'; // active clients should have a scheduled session happening
      } else if (status === 'completed' || status === 'inactive') {
        statusFilter = 'completed'; // completed clients have completed bookings
      }

      let url = `/api/admin/clients/${clientId}/bookings`;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      console.log('[ClientActionButton] Fetching from URL:', url);

      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        console.error('[ClientActionButton] Booking fetch failed:', res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log('[ClientActionButton] Booking fetch response:', data);
      console.log('[ClientActionButton] All bookings:', data.data?.map((b: any) => ({ id: b.id, status: b.booking_status })));

      if (data.data && data.data.length > 0) {
        // Filter out cancelled bookings and get the soonest upcoming non-cancelled booking
        const nonCancelledBookings = data.data.filter((b: any) => b.booking_status !== 'cancelled');
        console.log('[ClientActionButton] Non-cancelled bookings:', nonCancelledBookings.map((b: any) => ({ id: b.id, date: b.session_date, status: b.booking_status })));

        // Find the most recent (highest ID) non-cancelled booking
        // After a reschedule, we have old + new bookings, so pick newest (highest ID) not earliest date
        const nonCancelledBooking = nonCancelledBookings.length > 0
          ? nonCancelledBookings.reduce((latest: any, current: any) => {
              return current.id > latest.id ? current : latest;
            })
          : null;

        console.log('[ClientActionButton] Non-cancelled booking found (soonest):', nonCancelledBooking ? { id: nonCancelledBooking.id, date: nonCancelledBooking.session_date, status: nonCancelledBooking.booking_status } : 'NONE');
        if (nonCancelledBooking) {
          console.log('[ClientActionButton] Setting current booking:', nonCancelledBooking);
          setCurrentBooking(nonCancelledBooking);
        } else {
          console.warn('[ClientActionButton] All bookings are cancelled for client:', clientId);
          // Fallback to fetch all bookings
          const fallbackRes = await fetch(`/api/admin/clients/${clientId}/bookings`, { credentials: 'include' });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData.data && fallbackData.data.length > 0) {
              // Find the soonest upcoming non-cancelled booking
              const nonCancelledBookings = fallbackData.data.filter((b: any) => b.booking_status !== 'cancelled');
              const relevantBooking = nonCancelledBookings.length > 0
                ? nonCancelledBookings.reduce((earliest: any, current: any) => {
                    const earliestDate = new Date(earliest.session_date);
                    const currentDate = new Date(current.session_date);
                    return currentDate < earliestDate ? current : earliest;
                  })
                : null;
              if (relevantBooking) {
                console.log('[ClientActionButton] Setting current booking from fallback:', relevantBooking);
                setCurrentBooking(relevantBooking);
              } else {
                console.warn('[ClientActionButton] All fallback bookings are also cancelled');
                setCurrentBooking(null);
              }
            } else {
              console.warn('[ClientActionButton] No fallback bookings found');
              setCurrentBooking(null);
            }
          } else {
            console.error('[ClientActionButton] Fallback fetch failed');
            setCurrentBooking(null);
          }
        }
      } else {
        console.warn('[ClientActionButton] No bookings found for client:', clientId, 'with status filter:', statusFilter);

        // If no bookings found with status filter, try fetching all bookings
        console.log('[ClientActionButton] Trying to fetch all bookings for client:', clientId);
        const fallbackRes = await fetch(`/api/admin/clients/${clientId}/bookings`, { credentials: 'include' });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          console.log('[ClientActionButton] Fallback booking fetch response:', fallbackData);

          if (fallbackData.data && fallbackData.data.length > 0) {
            // Find the soonest upcoming non-cancelled booking
            const nonCancelledBookings = fallbackData.data.filter((b: any) => b.booking_status !== 'cancelled');
            const relevantBooking = nonCancelledBookings.length > 0
              ? nonCancelledBookings.reduce((earliest: any, current: any) => {
                  const earliestDate = new Date(earliest.session_date);
                  const currentDate = new Date(current.session_date);
                  return currentDate < earliestDate ? current : earliest;
                })
              : null;
            if (relevantBooking) {
              console.log('[ClientActionButton] Setting current booking from fallback:', relevantBooking);
              setCurrentBooking(relevantBooking);
            } else {
              console.warn('[ClientActionButton] All fallback bookings are cancelled, clearing booking');
              setCurrentBooking(null);
            }
          } else {
            console.warn('[ClientActionButton] No fallback bookings found, clearing booking');
            setCurrentBooking(null);
          }
        } else {
          console.error('[ClientActionButton] Fallback fetch failed, clearing booking');
          setCurrentBooking(null);
        }
      }
    } catch (err) {
      console.error('[ClientActionButton] Error fetching current booking:', err);
    } finally {
      setLoadingBooking(false);
    }
  };

  const getNextAction = (): NextAction => {
    // ========== RECURRING CLIENT WORKFLOW ==========
    // Dedicated status and flow for recurring clients

    console.log('[ClientActionButton] getNextAction - Client:', clientName, {
      status,
      therapistId,
      paymentVerified1,
      paymentAmount1,
      totalPaymentDue,
      isRecurring,
    });

    // RECURRING CLIENTS: Dedicated workflow
    if (isRecurring) {
      // Step 1: Recurring client ready to book next session
      if (status === 'recurring_client' || status === 'completed') {
        return {
          label: 'Book Session',
          type: 'booking',
        };
      }

      // Step 2: After booking, show reschedule/cancel (payment deadline handled by modal)
      // Recurring clients use PaymentDeadlineModal for payment, no separate verification button
      if (status === 'booking_scheduled') {
        return {
          label: 'Reschedule or Cancel',
          type: 'cancel',
        };
      }

      // Step 3: After payment verified, ready to view session when active
      if (status === 'active') {
        return {
          label: 'View Session',
          type: 'view',
        };
      }

      // No action needed
      return {
        label: 'No Action',
        type: 'none',
      };
    }

    // ========== NEW CLIENTS (ONE-TIME) ==========
    // Verify Payment for first session (before therapist assignment)
    if (status === 'intake' && !paymentVerified1) {
      return {
        label: 'Verify Payment',
        type: 'payment',
      };
    }

    // After payment verified, Sama assesses and assigns therapist
    if (status === 'assessment_pending' && !therapistId) {
      return {
        label: 'Select Therapist',
        type: 'therapist',
      };
    }

    // After therapist assigned, check if additional payment is needed
    if (therapistId && status === 'assessment_pending' && (paymentVerified1 || !paymentAmount1)) {
      const minimumFee = paymentAmount1 || 2000;
      const remainingAmount = (totalPaymentDue || 0) - minimumFee;

      console.log('[ClientActionButton] Checking additional payment:', {
        therapistId,
        status,
        paymentVerified1,
        minimumFee,
        remainingAmount,
        paymentVerified2,
      });

      if (remainingAmount <= 0) {
        return {
          label: 'Book Session',
          type: 'booking',
        };
      }

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

    // Ready for booking after all payments verified
    if (therapistId && status === 'ready_for_booking') {
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
    console.log('[ClientActionButton] Closing modal for client:', clientId);
    setCurrentBooking(null);
    setActiveModal(null);
  };

  const handleModalSuccess = async () => {
    // Call onActionComplete (which fetches fresh data) before closing the modal
    // This ensures the parent component updates with the new status
    console.log('[ClientActionButton] Modal success - calling onActionComplete');
    try {
      await Promise.resolve(onActionComplete());
      console.log('[ClientActionButton] onActionComplete finished');

      // Wait a moment for database to be ready with the new booking
      console.log('[ClientActionButton] Waiting for database to commit new booking...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Also refresh the current booking for this component
      console.log('[ClientActionButton] Refreshing current booking after modal success');
      await fetchCurrentBooking();

      // Wait a bit for React to process the state update
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('[ClientActionButton] Error during onActionComplete:', err);
    } finally {
      // Clear the sessionStorage ID after we're done with it
      sessionStorage.removeItem('lastCreatedBookingId');
    }
    // Close modal after data refresh completes
    console.log('[ClientActionButton] Closing modal');
    setActiveModal(null);
  };

  // Disable button if no valid next action, or if we're trying to book but clinic/therapist data isn't ready
  const isDisabled = nextAction.type === 'none' || (nextAction.type === 'booking' && (clinicLoading || typeof clinicId !== 'number' || typeof therapistId !== 'number'));

  // For recurring clients with a booked session, show both "Manage Booking" and "Verify Payment" buttons
  const showPaymentButton = isRecurring && status === 'booking_scheduled';

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className={`client-next-action-btn ${!isDisabled ? 'active' : 'disabled'}`}
          onClick={handleActionClick}
          title={`Next action: ${nextAction.label}`}
          disabled={isDisabled}
        >
          {nextAction.label}
        </button>

        {/* Payment Verification Button for recurring clients with bookings - shown below main button */}
        {showPaymentButton && (
          <button
            className="client-next-action-btn active"
            onClick={() => setActiveModal('payment')}
            title="Verify payment from client"
          >
            Verify Payment
          </button>
        )}
      </div>

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
        // Session payment for recurring clients with booked sessions
        const isSessionPayment = isRecurring && status === 'booking_scheduled';
        const isAdditionalPayment = therapistId && paymentVerified1 && !paymentVerified2;

        const paymentType = isSessionPayment ? 'session' : (isAdditionalPayment ? 'remaining' : 'assessment');
        const minimumFee = paymentAmount1 || 2000;
        const amount = isSessionPayment
          ? (totalPaymentDue || minimumFee)
          : (isAdditionalPayment ? ((totalPaymentDue || 0) - minimumFee) : minimumFee);

        return (
          <PaymentVerificationModal
            clientId={clientId}
            clientName={clientName}
            therapistName={therapistName || undefined}
            paymentType={paymentType}
            amount={amount > 0 ? amount : minimumFee}
            hasTherapist={therapistId ? true : false}
            isRecurring={isRecurring}
            bookingId={isSessionPayment ? currentBooking?.id : undefined}
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
      {activeModal === 'booking' && typeof clinicId === 'number' && typeof therapistId === 'number' && (
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

      {/* Complete Session Modal (for active status) */}
      {activeModal === 'view' && status === 'active' && (
        <CompleteSessionModal
          bookingId={currentBooking?.id}
          clientName={clientName}
          therapistName={therapistName || undefined}
          sessionDate={currentBooking?.session_date}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}

      {/* Session Tracker (for completed/inactive status) */}
      {activeModal === 'view' && (status === 'completed' || status === 'inactive') && (
        <SessionTracker
          clientId={clientId}
          clientName={clientName}
          onClose={handleModalClose}
        />
      )}

      {/* Reschedule/Cancel Modal (for booking_scheduled status) */}
      {activeModal === 'cancel' && status === 'booking_scheduled' && currentBooking ? (
        // Check if booking is in the past
        (() => {
          const sessionDate = new Date(currentBooking.session_date);
          const now = new Date();
          const isPast = sessionDate < now;

          if (isPast) {
            // Show error modal for past bookings
            return (
              <div className="modal-overlay" onClick={handleModalClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2 className="modal-title">Cannot Reschedule Past Session</h2>
                    <button
                      className="modal-close-btn"
                      onClick={handleModalClose}
                      type="button"
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-error" style={{ margin: '2rem' }}>
                    This session was scheduled for {new Date(currentBooking.session_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} and cannot be rescheduled or cancelled anymore.
                    <br />
                    <br />
                    Please book a new session or contact support if you need to modify this booking.
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="modal-btn modal-btn--secondary" onClick={handleModalClose}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Booking is in the future, show reschedule modal
          return (
            <RescheduleModal
              clientId={clientId}
              bookingId={currentBooking?.id || 0}
              clientName={clientName}
              therapistId={therapistId || 0}
              therapistName={therapistName || undefined}
              currentSessionDate={currentBooking?.session_date || ''}
              clinicId={clinicId || 0}
              paymentAmount={paymentAmount1}
              onSuccess={handleModalSuccess}
              onClose={handleModalClose}
            />
          );
        })()
      ) : null}

      {/* Payment Deadline Modal (for recurring clients within 24 hours of unpaid session) */}
      {showPaymentDeadline && currentBooking && (
        <PaymentDeadlineModal
          clientId={clientId}
          clientName={clientName}
          bookingId={currentBooking.id}
          sessionDate={currentBooking.session_date}
          therapistName={therapistName || undefined}
          hoursRemaining={
            (new Date(currentBooking.session_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60)
          }
          paymentAmount={totalPaymentDue}
          onSuccess={handleModalSuccess}
          onClose={() => setShowPaymentDeadline(false)}
        />
      )}
    </>
  );
}
