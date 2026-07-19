import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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
 * GET /api/admin/clients/[id]/bookings - Get booking history for a client
 * Query: status (optional filter: scheduled|confirmed|completed|cancelled|expired)
 * Returns: array of {id, session_date, therapist_name, booking_status, payment_status, amount}
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
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Parse client ID
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
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
        session_date,
        duration_minutes,
        booking_status,
        payment_status,
        notes,
        created_at,
        therapists:therapist_id (id, name, hourly_rate),
        clinic_rooms:room_id (id, room_name)
      `)
      .eq('client_id', clientId);

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('booking_status', statusFilter);
    }

    // Fetch bookings ordered by date descending
    const { data: bookings, error } = await query
      .order('session_date', { ascending: false });

    console.log(`[Bookings API] Query for client ${clientId} with status filter: ${statusFilter}`);
    console.log(`[Bookings API] Raw bookings returned:`, bookings ? bookings.map((b: any) => ({ id: b.id, status: b.booking_status, date: b.session_date })) : 'null');

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // For each booking, calculate expected amount from therapist rate, or get actual paid amount if exists
    const bookingsWithAmount = await Promise.all(
      (bookings || []).map(async (booking: any) => {
        const therapist = Array.isArray(booking.therapists) ? booking.therapists[0] : booking.therapists;
        const room = Array.isArray(booking.clinic_rooms) ? booking.clinic_rooms[0] : booking.clinic_rooms;

        // Calculate expected amount from therapist hourly_rate
        let amount = 0;
        if (therapist) {
          const hourlyRate = therapist.hourly_rate || 2000; // Default to 2000 if not set
          if (booking.duration_minutes) {
            amount = (hourlyRate / 60) * booking.duration_minutes;
          }
          console.log(`[Bookings] Therapist: ${therapist.name}, Rate: ${hourlyRate}, Duration: ${booking.duration_minutes}, Calculated Amount: ${amount}`);
        }

        // Override with actual payment amount if a payment record exists
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_records')
          .select('amount_paid')
          .eq('booking_id', booking.id)
          .order('payment_date', { ascending: false })
          .limit(1)
          .single();

        if (!paymentError && paymentData) {
          amount = paymentData.amount_paid;
        }

        return {
          id: booking.id,
          session_date: booking.session_date,
          duration_minutes: booking.duration_minutes,
          therapist_name: therapist?.name || null,
          room_id: room?.id || null,
          room_name: room?.room_name || null,
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          amount: amount,
          notes: booking.notes || null,
          created_at: booking.created_at,
        };
      })
    );

    return NextResponse.json(
      {
        data: bookingsWithAmount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/clients/[id]/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
