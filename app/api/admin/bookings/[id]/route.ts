import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkPermission(
  request: NextRequest,
  requiredPermission: string
): Promise<
  | { authorized: false; error: string; status: number }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found', status: 401 };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token', status: 401 };
  }

  if (!payload.permissions.includes(requiredPermission)) {
    return { authorized: false, error: 'Insufficient permissions', status: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * GET /api/admin/bookings/[id] - Get booking details
 * Returns full booking with client info, therapist name, room details, payment status
 * Status: 200, 401/403/404/500 on error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  unstable_noStore();

  const auth = await checkPermission(request, 'view_bookings');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;

    // Parse ID as number (bookings.id is BIGSERIAL)
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        therapist_id,
        session_date,
        duration_minutes,
        session_type,
        clinic_id,
        room_id,
        notes,
        payment_status,
        payment_date,
        payment_deadline,
        marked_paid_by_user_id,
        marked_paid_at,
        booking_status,
        cancelled_by_user_id,
        cancellation_reason,
        cancelled_at,
        created_at,
        updated_at,
        clients:client_id (id, name, email, phone),
        therapists:therapist_id (id, name, email),
        clinic_rooms:room_id (id, room_name, room_type, capacity)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ data: booking }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/bookings/[id]/payment-received - Mark payment received
 * Body: {payment_date (ISO)}
 * Response: {success, data: {booking, payment_record}}
 * Status: 200, 400/401/403/404/500 on error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'create_payment');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { payment_date } = body;

    // Validate payment_date
    if (!payment_date) {
      return NextResponse.json(
        { error: 'payment_date is required' },
        { status: 400 }
      );
    }

    // Validate ISO date format
    const paymentDateObj = new Date(payment_date);
    if (isNaN(paymentDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid payment_date format. Must be ISO 8601.' },
        { status: 400 }
      );
    }

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Fetch booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        therapist_id,
        duration_minutes,
        payment_status,
        booking_status
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if already paid
    if (booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Booking payment already marked as received' },
        { status: 400 }
      );
    }

    // Fetch therapist to get hourly rate
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id, hourly_rate')
      .eq('id', booking.therapist_id)
      .single();

    if (therapistError) {
      console.error('Error fetching therapist:', therapistError);
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Get therapist's hourly rate (default to 2000 if not set)
    const hourlyRate = therapist?.hourly_rate || 2000;

    // Calculate actual cost: (hourly_rate / 60) * duration_minutes
    const actualCost = (hourlyRate / 60) * booking.duration_minutes;

    // Fixed payment amount: 2000 EGP
    const amountPaid = 2000;

    // Calculate refund or additional charge
    let refundAmount = 0;
    let additionalCharge = 0;
    let chargeStatus = 'pending';

    if (actualCost < amountPaid) {
      refundAmount = amountPaid - actualCost;
    } else if (actualCost > amountPaid) {
      additionalCharge = actualCost - amountPaid;
      chargeStatus = 'pending';
    }

    // Create payment record
    const { data: paymentRecord, error: paymentRecordError } = await supabase
      .from('payment_records')
      .insert([
        {
          booking_id: booking.id,
          client_id: booking.client_id,
          therapist_id: booking.therapist_id,
          amount_paid: amountPaid,
          actual_cost: actualCost,
          refund_amount: refundAmount,
          additional_charge: additionalCharge,
          charge_status: chargeStatus,
          payment_date: paymentDateObj.toISOString(),
          marked_by_user_id: auth.user.userId,
        },
      ])
      .select()
      .single();

    if (paymentRecordError) {
      console.error('Error creating payment record:', paymentRecordError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Update booking: payment_status='paid', booking_status='confirmed', clear hold, set confirmed time
    const now = new Date().toISOString();
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        booking_status: 'confirmed',
        hold_expires_at: null, // CHANGE: Clear 10-minute hold since payment verified
        confirmed_at: now, // CHANGE: Record when payment was confirmed
        payment_date: paymentDateObj.toISOString(),
        marked_paid_by_user_id: auth.user.userId,
        marked_paid_at: now,
        updated_at: now,
      })
      .eq('id', booking.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    // Log that payment verification cleared the hold
    console.log('[bookings PUT] ✓ Payment verified & hold cleared', {
      bookingId: booking.id,
      booking_status: 'confirmed',
      hold_expires_at: 'NULL (cleared)',
      confirmed_at: now,
      payment_status: 'paid',
      message: 'Draft booking confirmed. 10-minute hold released.',
    });

    // Log audit action
    const actionDescription = `Payment received for booking ${booking.id}: ${amountPaid} EGP (actual cost: ${actualCost})` +
      (refundAmount > 0 ? `, refund: ${refundAmount}` : '') +
      (additionalCharge > 0 ? `, additional charge: ${additionalCharge}` : '');

    await logAuditAction({
      adminId: auth.user.userId,
      action: 'create',
      entityType: 'payment',
      entityId: paymentRecord.id,
      entityName: actionDescription,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          booking: updatedBooking,
          payment_record: paymentRecord,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/admin/bookings/[id]/payment-received error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/bookings/[id] - Update booking fields
 * Body: {payment_status?, booking_status?, ...}
 * Response: {success, data: updated_booking}
 * Status: 200, 400/401/403/404/500 on error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check for manage_clients, view_bookings, or view_payments permission
  let auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    auth = await checkPermission(request, 'view_bookings');
  }
  if (!auth.authorized) {
    auth = await checkPermission(request, 'view_payments');
  }
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json();

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Build update object with allowed fields
    const updateData: any = {};
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.booking_status !== undefined) updateData.booking_status = body.booking_status;
    if (body.payment_date !== undefined) updateData.payment_date = body.payment_date;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Always update timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('[PATCH /api/admin/bookings/[id]] Updating booking', bookingId, 'with:', JSON.stringify(updateData));

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH /api/admin/bookings/[id]] Error updating booking:', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
      });
      return NextResponse.json({
        error: 'Failed to update booking: ' + (updateError.message || 'Unknown error'),
        code: updateError.code,
        details: updateError.details
      }, { status: 500 });
    }

    console.log('[PATCH /api/admin/bookings/[id]] Successfully updated booking:', bookingId);

    return NextResponse.json(
      { success: true, data: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/admin/bookings/[id]] error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown')
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/bookings/[id] - Cancel booking
 * Body: {reason? (optional cancellation reason)}
 * Response: {success, data: cancelled_booking}
 * Status: 200, 400/401/403/404/500 on error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'cancel_booking');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { reason, refund_requested = true } = body; // Default to refund if not specified

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, booking_status, payment_status, client_id, therapist_id, session_date, duration_minutes')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if can be cancelled (only scheduled or confirmed status)
    if (!['scheduled', 'confirmed'].includes(booking.booking_status)) {
      return NextResponse.json(
        { error: `Cannot cancel booking with status '${booking.booking_status}'` },
        { status: 400 }
      );
    }

    // If payment was received, handle refund (only if refund_requested is true)
    // If client keeps payment, don't deduct from total_amount_paid
    if (booking.payment_status === 'paid' && refund_requested) {
      // Fetch the therapist to get their hourly rate
      const { data: therapist, error: therapistError } = await supabase
        .from('therapists')
        .select('id, hourly_rate')
        .eq('id', booking.therapist_id)
        .single();

      let refundAmount = 2000; // Default refund amount

      if (!therapistError && therapist) {
        const hourlyRate = therapist.hourly_rate || 2000;
        // Calculate actual cost based on therapist's rate and booking duration
        refundAmount = Math.round((hourlyRate / 60) * booking.duration_minutes);
        console.log('[bookings DELETE] Refund calculation:', {
          therapist: therapist.id,
          hourlyRate,
          duration: booking.duration_minutes,
          refundAmount,
        });
      } else {
        console.warn('[bookings DELETE] Could not fetch therapist rate, using default 2000');
      }

      // Create a refund entry in payment_records
      const refundData: any = {
        booking_id: booking.id,
        client_id: booking.client_id,
        therapist_id: booking.therapist_id,
        amount_paid: 0, // No amount paid in refund record
        actual_cost: 0,
        refund_amount: refundAmount, // Dynamic refund based on therapist rate
        additional_charge: 0,
        charge_status: 'pending', // Refund pending
        payment_date: new Date().toISOString(),
      };

      // Only include marked_by_user_id if it's a valid UUID (36 chars with hyphens)
      if (auth.user.userId && auth.user.userId.length === 36) {
        refundData.marked_by_user_id = auth.user.userId;
      }

      console.log('[bookings DELETE] Creating refund record:', refundData);
      const { error: refundError } = await supabase
        .from('payment_records')
        .insert([refundData]);

      if (refundError) {
        console.error('[bookings DELETE] Error creating refund record:', {
          message: refundError.message,
          code: refundError.code,
          details: refundError.details,
        });
        // Continue with cancellation even if refund record fails
      } else {
        console.log('[bookings DELETE] Refund record created successfully');
      }
    }

    // Cancel the booking and update payment_status to reflect refund if paid
    const { data: cancelledBooking, error: cancelError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: booking.payment_status === 'paid' ? 'refunded' : booking.payment_status,
        cancelled_by_user_id: auth.user.userId,
        cancellation_reason: reason || null,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
      .select()
      .single();

    if (cancelError) {
      console.error('Error cancelling booking:', cancelError);
      return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }

    // If payment was made AND refund requested, deduct refund from client's total_amount_paid
    // If client keeps payment, don't deduct anything
    console.log('[bookings DELETE] Checking if refund needed:', {
      payment_status: booking.payment_status,
      refund_requested,
      shouldDeduct: booking.payment_status === 'paid' && refund_requested,
    });

    if (booking.payment_status === 'paid' && refund_requested) {
      console.log('[bookings DELETE] ✓ Deducting refund from client total_amount_paid');

      // Fetch client
      const { data: clientForRefund, error: clientError } = await supabase
        .from('clients')
        .select('id, total_amount_paid')
        .eq('id', booking.client_id)
        .single();

      if (clientError) {
        console.error('[bookings DELETE] Error fetching client for refund:', clientError);
      } else if (clientForRefund) {
        // Fetch therapist to calculate refund amount
        const { data: therapistForRefund, error: therapistRefundError } = await supabase
          .from('therapists')
          .select('id, hourly_rate')
          .eq('id', booking.therapist_id)
          .single();

        let refundAmount = 2000; // Default refund amount
        if (therapistRefundError) {
          console.warn('[bookings DELETE] Could not fetch therapist for rate, using default 2000');
        } else if (therapistForRefund) {
          const hourlyRate = therapistForRefund.hourly_rate || 2000;
          refundAmount = Math.round((hourlyRate / 60) * booking.duration_minutes);
        }

        const newTotal = Math.max(0, (clientForRefund.total_amount_paid || 0) - refundAmount);

        console.log('[bookings DELETE] Deducting refund:', {
          clientId: booking.client_id,
          oldTotal: clientForRefund.total_amount_paid,
          refundAmount,
          newTotal,
          therapistId: booking.therapist_id,
        });

        const { error: updateError } = await supabase
          .from('clients')
          .update({
            total_amount_paid: newTotal,
            // CRITICAL: Reset session payment flags after refund so next booking can show "Verify Payment"
            // These are only reset when refund happens; if client keeps money, flags stay for next booking to use
            session_payment_received: false,
            session_payment_date: null,
            session_payment_amount: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.client_id);

        if (updateError) {
          console.error('[bookings DELETE] Error deducting refund from client total:', updateError);
        } else {
          console.log('[bookings DELETE] Successfully deducted refund from client total');
        }
      }
    }

    // For recurring clients, reset status to recurring_client so they can book a new session
    const { data: client, error: clientFetchError } = await supabase
      .from('clients')
      .select('id, is_recurring, status')
      .eq('id', booking.client_id)
      .single();

    console.log('[bookings DELETE] Client fetch for status reset:', { clientId: booking.client_id, client, clientFetchError });

    if (client && client.is_recurring) {
      console.log('[bookings DELETE] Resetting recurring client status from', client.status, 'to recurring_client');
      const { data: updatedClient, error: statusUpdateError } = await supabase
        .from('clients')
        .update({
          status: 'recurring_client',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.client_id)
        .select();

      if (statusUpdateError) {
        console.error('[bookings DELETE] Error updating recurring client status:', statusUpdateError);
        // Continue anyway - booking was cancelled successfully
      } else {
        console.log('[bookings DELETE] Successfully updated recurring client status:', { clientId: booking.client_id, updatedClient });
      }
    } else {
      console.log('[bookings DELETE] Client is not recurring or fetch failed:', { client, clientFetchError });
    }

    // Create audit entry in client_status_history
    try {
      await supabase
        .from('client_status_history')
        .insert([
          {
            client_id: booking.client_id,
            old_status: 'booking_scheduled', // Previous implied status
            new_status: 'booking_cancelled',
            changed_by_user_id: auth.user.userId,
            reason: reason || 'Booking cancelled',
          },
        ]);
    } catch (err) {
      // Log but don't fail if status history insert fails
      console.error('Error creating status history:', err);
    }

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'delete',
      entityType: 'booking',
      entityId: booking.id.toString(),
      entityName: `Booking ${booking.id} cancelled${reason ? `: ${reason}` : ''}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: cancelledBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/admin/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
