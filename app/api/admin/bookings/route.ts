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

    // Validate required fields
    if (!therapist_id || !client_id || !session_date || !duration_minutes || !clinic_id) {
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

    // Calculate payment deadline (24 hours from now)
    const now = new Date();
    const paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          client_id,
          therapist_id,
          session_date,
          duration_minutes,
          session_type: session_type || 'single',
          room_id: room_id || null,
          notes: notes || null,
          payment_status: 'pending',
          booking_status: 'scheduled',
          payment_deadline: paymentDeadline.toISOString(),
          status: 'scheduled', // Maintain backwards compatibility with original status field
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', {
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint,
        code: bookingError.code,
        status: bookingError.status,
        statusText: bookingError.statusText,
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
