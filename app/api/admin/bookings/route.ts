import { NextRequest, NextResponse } from 'next/server';
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
 * POST /api/admin/bookings - Create a new booking
 * Body: {therapist_id, client_id, session_date (ISO), duration_minutes, session_type, clinic_id, room_id, notes?}
 * Response: {success, data: {id, client_id, therapist_id, session_date, payment_deadline, payment_amount, ...}}
 * Status: 201 on success, 400/401/403/404/500 on error
 */
export async function POST(request: NextRequest) {
  // Check if user has create_booking OR manage_clients permission
  let auth = await checkPermission(request, 'create_booking');
  if (!auth.authorized) {
    auth = await checkPermission(request, 'manage_clients');
  }
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { therapist_id, client_id, session_date, duration_minutes, session_type, clinic_id, room_id, notes } = body;

    console.log('[bookings POST] Request body:', { therapist_id, client_id, session_date, duration_minutes, clinic_id });

    // Validate required fields
    if (!therapist_id || !client_id || !session_date || !duration_minutes || !clinic_id) {
      console.error('[bookings POST] Validation failed:', { therapist_id, client_id, session_date, duration_minutes, clinic_id });
      return NextResponse.json(
        { error: 'Missing required fields: therapist_id, client_id, session_date, duration_minutes, clinic_id' },
        { status: 400 }
      );
    }

    // Validate session_type
    if (!['single', 'group', 'couple'].includes(session_type || 'single')) {
      return NextResponse.json(
        { error: 'Invalid session_type. Must be one of: single, group, couple' },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', client_id)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify therapist exists
    const { data: therapistData, error: therapistError } = await supabase
      .from('therapists')
      .select('id, name')
      .eq('id', therapist_id)
      .single();

    if (therapistError || !therapistData) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Verify room exists (if provided)
    if (room_id) {
      const { data: roomData, error: roomError } = await supabase
        .from('clinic_rooms')
        .select('id, room_name')
        .eq('id', room_id)
        .single();

      if (roomError || !roomData) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
    }

    // DOUBLE-BOOKING PREVENTION: Check for existing bookings
    // A therapist cannot be booked twice at the same time (prevents scheduling conflicts)
    const sessionStart = new Date(session_date);
    const sessionEnd = new Date(sessionStart.getTime() + (duration_minutes || 60) * 60 * 1000);

    console.log('[bookings POST] Checking for conflicts:', {
      therapist_id,
      session_date,
      duration_minutes,
      sessionStart: sessionStart.toISOString(),
      sessionEnd: sessionEnd.toISOString(),
    });

    // Get all active bookings for this therapist that overlap with the requested time
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('id, session_date, duration_minutes, booking_status')
      .eq('therapist_id', therapist_id)
      .in('booking_status', ['draft', 'scheduled', 'confirmed'])
      .lte('session_date', sessionEnd.toISOString())
      .gte('session_date', new Date(sessionStart.getTime() - (480 * 60 * 1000)).toISOString()); // 8 hours buffer

    if (conflictError) {
      console.error('[bookings POST] Error checking conflicts:', conflictError);
      return NextResponse.json({ error: 'Failed to check booking conflicts' }, { status: 500 });
    }

    // Check if any booking overlaps with the requested time
    if (conflictingBookings && conflictingBookings.length > 0) {
      for (const existingBooking of conflictingBookings) {
        const existingStart = new Date(existingBooking.session_date);
        const existingEnd = new Date(existingStart.getTime() + (existingBooking.duration_minutes || 60) * 60 * 1000);

        // Check if times overlap
        const hasOverlap = sessionStart < existingEnd && sessionEnd > existingStart;

        if (hasOverlap) {
          console.warn('[bookings POST] Double-booking attempt detected:', {
            therapist_id,
            existingBooking: { id: existingBooking.id, status: existingBooking.booking_status },
            requestedTime: { start: sessionStart.toISOString(), end: sessionEnd.toISOString() },
            existingTime: { start: existingStart.toISOString(), end: existingEnd.toISOString() },
          });
          return NextResponse.json(
            { error: `Therapist is already booked during this time slot. Cannot create overlapping bookings.` },
            { status: 409 }
          );
        }
      }
    }

    // Calculate payment deadline (24 hours from now)
    const now = new Date();
    const paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Calculate hold expiration (10 minutes from now for slot reservation)
    const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // Create the booking as DRAFT with 10-minute hold
    // draft = slot selected, awaiting payment verification
    // hold_expires_at = when this draft booking should be auto-released if not verified
    const bookingData = {
      client_id,
      therapist_id,
      clinic_id,
      session_date,
      duration_minutes,
      session_type: session_type || 'single',
      room_id: room_id || null,
      notes: notes || null,
      payment_status: 'pending',
      booking_status: 'draft',
      hold_expires_at: holdExpiresAt.toISOString(),
      payment_deadline: paymentDeadline.toISOString(),
      status: 'scheduled',
    };

    console.log('[bookings POST] Inserting booking with data:', bookingData);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', {
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint,
        code: bookingError.code,
        body: {
          client_id,
          therapist_id,
          session_date,
          duration_minutes,
          session_type,
          room_id,
          clinic_id,
        },
      });
      return NextResponse.json({
        error: 'Failed to create booking',
        details: bookingError.message || 'Database error',
        hint: bookingError.hint || 'Check if all columns exist in bookings table',
        code: bookingError.code
      }, { status: 500 });
    }

    // Log draft booking creation with hold timer
    console.log('[bookings POST] ✓ Created DRAFT booking with 10-min hold', {
      bookingId: booking.id,
      clientId: client_id,
      therapistId: therapist_id,
      booking_status: 'draft',
      hold_expires_at: booking.hold_expires_at,
      session_date: booking.session_date,
      message: 'Slot is now reserved. Reception must verify payment within 10 minutes.',
    });

    // Update client status and payment fields based on client type
    console.log('[bookings] Updating client', client_id, 'status to booking_scheduled');

    const { data: clientTypeData, error: clientTypeError } = await supabase
      .from('clients')
      .select('is_recurring')
      .eq('id', client_id)
      .single();

    if (clientTypeError) {
      console.error('[bookings] Error fetching client type:', clientTypeError);
    }

    // For recurring clients, reset payment verification (they pay after booking)
    // For non-recurring clients, keep existing payment status
    const clientUpdate: any = {
      status: 'booking_scheduled',
      updated_at: new Date().toISOString(),
    };

    const isRecurringClient = clientTypeData?.is_recurring === true;
    console.log('[bookings] Client type check - is_recurring:', isRecurringClient);

    if (isRecurringClient) {
      // Recurring clients: reset payment to verify later within 24 hours
      clientUpdate.payment_verified_1 = false;
      clientUpdate.payment_date_1 = null;
      clientUpdate.payment_amount_1 = null;
      console.log('[bookings] This is a recurring client - will reset payment_verified_1 to false');
    }

    console.log('[bookings] Updating client with:', clientUpdate);
    const { error: clientUpdateError, data: updatedClient } = await supabase
      .from('clients')
      .update(clientUpdate)
      .eq('id', client_id)
      .select();

    if (clientUpdateError) {
      console.error('[bookings] Error updating client status:', {
        error: clientUpdateError,
        client_id,
        update_data: clientUpdate
      });
      // Fail the request if critical client update fails
      return NextResponse.json({
        error: 'Failed to update client status after booking',
        details: clientUpdateError.message,
        code: clientUpdateError.code
      }, { status: 500 });
    } else {
      console.log('[bookings] Client status updated successfully:', {
        client_id,
        updated_rows: updatedClient?.length,
        new_status: updatedClient?.[0]?.status,
        payment_verified_1: updatedClient?.[0]?.payment_verified_1,
        is_recurring: updatedClient?.[0]?.is_recurring
      });

      // Verify the reset actually took effect by re-fetching
      if (isRecurringClient) {
        const { data: verifyClient, error: verifyError } = await supabase
          .from('clients')
          .select('id, payment_verified_1, payment_amount_1, payment_date_1')
          .eq('id', client_id)
          .single();

        if (verifyError) {
          console.error('[bookings] Error verifying payment reset:', verifyError);
        } else {
          console.log('[bookings] VERIFICATION: Payment reset result for client', client_id, ':', {
            payment_verified_1: verifyClient?.payment_verified_1,
            payment_amount_1: verifyClient?.payment_amount_1,
            payment_date_1: verifyClient?.payment_date_1
          });
        }
      }
    }

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'create',
      entityType: 'booking',
      entityId: booking.id.toString(),
      entityName: `Booking for ${clientData.name} with ${therapistData.name}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: booking.id,
          client_id: booking.client_id,
          therapist_id: booking.therapist_id,
          session_date: booking.session_date,
          duration_minutes: booking.duration_minutes,
          session_type: booking.session_type,
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          payment_deadline: booking.payment_deadline,
          room_id: booking.room_id,
          notes: booking.notes,
          created_at: booking.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/bookings?client_id=X&status=Y - Get client booking history
 * Query params: client_id (required), status (optional: scheduled|confirmed|completed|cancelled|expired)
 * Response: array of bookings for client, most recent first
 * Status: 200, 400/401/403/404/500 on error
 */
export async function GET(request: NextRequest) {
  const auth = await checkPermission(request, 'view_bookings');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const statusFilter = searchParams.get('status');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Query parameter client_id is required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Validate status filter if provided
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'expired'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      return NextResponse.json(
        { error: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        therapist_id,
        session_date,
        duration_minutes,
        session_type,
        booking_status,
        payment_status,
        payment_deadline,
        room_id,
        notes,
        created_at,
        updated_at,
        cancelled_at,
        cancellation_reason,
        therapists:therapist_id (id, name),
        clinic_rooms:room_id (id, room_name)
      `)
      .eq('client_id', clientId)
      .order('session_date', { ascending: false });

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('booking_status', statusFilter);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ data: bookings, count: bookings.length }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
