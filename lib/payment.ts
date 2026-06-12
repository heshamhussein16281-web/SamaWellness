import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Payment calculation result containing cost breakdown and refund/charge information
 */
export interface PaymentDetails {
  actualCost: number;
  refundAmount: number;
  additionalCharge: number;
  chargeStatus: 'none' | 'pending';
}

/**
 * Payment record to be inserted into database
 */
export interface PaymentRecord {
  id?: string;
  bookingId: string;
  clientId: string;
  therapistId: string;
  clinicId: string;
  amountPaid: number;
  actualCost: number;
  refundAmount: number;
  additionalCharge: number;
  chargeStatus: 'none' | 'pending';
  paymentDate: string;
  markedByUserId: string;
  createdAt?: string;
}

/**
 * Payment status retrieved from database
 */
export interface PaymentStatus {
  status: 'paid' | 'pending' | 'expired';
  daysRemaining: number;
  amountPaid: number;
  paymentDeadline: string;
}

/**
 * Formatted payment display for UI
 */
export interface PaymentDisplay {
  displayText: string;
  breakdown: {
    amountPaid: number;
    refundAmount: number;
    additionalCharge: number;
  };
}

/**
 * Calculate payment details including actual cost, refunds, and additional charges.
 *
 * @param hourlyRate - Therapist's hourly rate in EGP
 * @param durationMinutes - Session duration in minutes
 * @param amountPaid - Amount paid by client (defaults to 2000 EGP)
 * @returns PaymentDetails object with cost breakdown and charge status
 *
 * @example
 * const details = calculatePaymentDetails({ hourlyRate: 600, durationMinutes: 60, amountPaid: 2000 });
 * // Returns: { actualCost: 600, refundAmount: 1400, additionalCharge: 0, chargeStatus: 'none' }
 */
export function calculatePaymentDetails(
  hourlyRate: number,
  durationMinutes: number,
  amountPaid: number = 2000
): PaymentDetails {
  // Validate inputs
  if (hourlyRate < 0 || durationMinutes < 0 || amountPaid < 0) {
    throw new Error('Payment parameters cannot be negative');
  }

  if (!Number.isFinite(hourlyRate) || !Number.isFinite(durationMinutes) || !Number.isFinite(amountPaid)) {
    throw new Error('Payment parameters must be valid numbers');
  }

  // Calculate actual cost: (hourlyRate / 60) * durationMinutes
  const minuteRate = hourlyRate / 60;
  const actualCost = minuteRate * durationMinutes;

  // Determine refund/charge status
  let refundAmount = 0;
  let additionalCharge = 0;
  let chargeStatus: 'none' | 'pending' = 'none';

  const difference = actualCost - amountPaid;

  if (difference < 0) {
    // Client overpaid - calculate refund
    refundAmount = Math.abs(difference);
    chargeStatus = 'none';
  } else if (difference > 0) {
    // Client underpaid - calculate additional charge
    additionalCharge = difference;
    chargeStatus = 'pending';
  }
  // If difference === 0, exact amount paid - all zeros, chargeStatus 'none'

  return {
    actualCost: Math.round(actualCost * 100) / 100, // Round to 2 decimal places
    refundAmount: Math.round(refundAmount * 100) / 100,
    additionalCharge: Math.round(additionalCharge * 100) / 100,
    chargeStatus,
  };
}

/**
 * Create a payment record in the database.
 *
 * @param input - Payment record data
 * @param supabase - Supabase client instance
 * @returns Object with success flag, optional error, and the created payment record
 *
 * @example
 * const result = await createPaymentRecord(
 *   {
 *     bookingId: '123',
 *     clientId: 'client-456',
 *     therapistId: 'therapist-789',
 *     clinicId: 'clinic-101',
 *     amountPaid: 2000,
 *     actualCost: 600,
 *     refundAmount: 1400,
 *     additionalCharge: 0,
 *     chargeStatus: 'none',
 *     paymentDate: new Date().toISOString(),
 *     markedByUserId: 'user-202'
 *   },
 *   supabase
 * );
 */
export async function createPaymentRecord(
  input: PaymentRecord,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string; paymentRecord?: PaymentRecord }> {
  try {
    // Validate required fields
    if (!input.bookingId || !input.clientId || !input.therapistId || !input.clinicId) {
      return { success: false, error: 'Missing required booking or party identifiers' };
    }

    if (!input.paymentDate || !input.markedByUserId) {
      return { success: false, error: 'Missing payment date or marking user' };
    }

    if (typeof input.amountPaid !== 'number' || typeof input.actualCost !== 'number') {
      return { success: false, error: 'Invalid payment amounts' };
    }

    const { data, error } = await supabase
      .from('payment_records')
      .insert([
        {
          booking_id: input.bookingId,
          client_id: input.clientId,
          therapist_id: input.therapistId,
          clinic_id: input.clinicId,
          amount_paid: input.amountPaid,
          actual_cost: input.actualCost,
          refund_amount: input.refundAmount,
          additional_charge: input.additionalCharge,
          charge_status: input.chargeStatus,
          payment_date: input.paymentDate,
          marked_by_user_id: input.markedByUserId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Payment record creation error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from payment record creation' };
    }

    // Map database response to PaymentRecord format
    const paymentRecord: PaymentRecord = {
      id: data.id,
      bookingId: data.booking_id,
      clientId: data.client_id,
      therapistId: data.therapist_id,
      clinicId: data.clinic_id,
      amountPaid: data.amount_paid,
      actualCost: data.actual_cost,
      refundAmount: data.refund_amount,
      additionalCharge: data.additional_charge,
      chargeStatus: data.charge_status,
      paymentDate: data.payment_date,
      markedByUserId: data.marked_by_user_id,
      createdAt: data.created_at,
    };

    return { success: true, paymentRecord };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error creating payment record';
    console.error('Payment record creation exception:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Calculate the payment deadline (24 hours from creation).
 *
 * @param createdAt - ISO timestamp of payment creation
 * @returns ISO timestamp 24 hours after createdAt
 *
 * @example
 * const created = new Date().toISOString();
 * const deadline = calculatePaymentDeadline(created);
 * // deadline is 24 hours later
 */
export function calculatePaymentDeadline(createdAt: string): string {
  try {
    const createdDate = new Date(createdAt);

    if (isNaN(createdDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Add 24 hours (86400000 milliseconds)
    const deadlineDate = new Date(createdDate.getTime() + 86400000);

    return deadlineDate.toISOString();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid timestamp';
    throw new Error(`Failed to calculate payment deadline: ${errorMessage}`);
  }
}

/**
 * Get the current payment status for a booking.
 *
 * @param bookingId - ID of the booking
 * @param supabase - Supabase client instance
 * @returns PaymentStatus object with status, days remaining, and deadline
 *
 * @example
 * const status = await getPaymentStatus('booking-123', supabase);
 * if (status.status === 'expired') {
 *   console.log('Payment deadline passed', status.daysRemaining, 'days ago');
 * }
 */
export async function getPaymentStatus(
  bookingId: string,
  supabase: SupabaseClient
): Promise<PaymentStatus | null> {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('payment_status, payment_deadline, amount_paid')
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking for payment status:', error);
      return null;
    }

    if (!booking) {
      console.warn('Booking not found:', bookingId);
      return null;
    }

    const now = new Date();
    const deadline = new Date(booking.payment_deadline);

    // Calculate days remaining
    const diffMs = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Determine status based on deadline
    let status: 'paid' | 'pending' | 'expired';

    if (booking.payment_status === 'paid') {
      status = 'paid';
    } else if (now > deadline) {
      status = 'expired';
    } else {
      status = 'pending';
    }

    return {
      status,
      daysRemaining,
      amountPaid: booking.amount_paid || 0,
      paymentDeadline: booking.payment_deadline,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching payment status';
    console.error('Payment status retrieval error:', error);
    throw new Error(`Failed to get payment status: ${errorMessage}`);
  }
}

/**
 * Format payment information for UI display.
 *
 * @param amountPaid - Amount paid by client
 * @param refundAmount - Refund amount (if any)
 * @param additionalCharge - Additional charge amount (if any)
 * @returns PaymentDisplay object with formatted text and breakdown data
 *
 * @example
 * const display = formatPaymentDisplay(2000, 1400, 0);
 * // Returns: {
 * //   displayText: '2000 EGP paid → Refund: 1400 EGP',
 * //   breakdown: { amountPaid: 2000, refundAmount: 1400, additionalCharge: 0 }
 * // }
 */
export function formatPaymentDisplay(
  amountPaid: number,
  refundAmount: number,
  additionalCharge: number
): PaymentDisplay {
  // Validate inputs
  if (!Number.isFinite(amountPaid) || !Number.isFinite(refundAmount) || !Number.isFinite(additionalCharge)) {
    throw new Error('Payment amounts must be valid numbers');
  }

  if (amountPaid < 0 || refundAmount < 0 || additionalCharge < 0) {
    throw new Error('Payment amounts cannot be negative');
  }

  let displayText: string;

  if (refundAmount > 0) {
    displayText = `${amountPaid} EGP paid → Refund: ${refundAmount} EGP`;
  } else if (additionalCharge > 0) {
    displayText = `${amountPaid} EGP paid → Additional charge: ${additionalCharge} EGP`;
  } else {
    displayText = `${amountPaid} EGP paid (exact amount)`;
  }

  return {
    displayText,
    breakdown: {
      amountPaid,
      refundAmount,
      additionalCharge,
    },
  };
}
