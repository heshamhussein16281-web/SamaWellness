import { NextRequest, NextResponse } from 'next/server';
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
 * GET /api/admin/bookings/pending-verifications
 *
 * Fetch bookings awaiting payment verification
 * Used by dashboard to show blocking modal when 10-min hold expires
 *
 * Returns: draft bookings where hold_expires_at has PASSED and payment NOT verified
 *
 * WORKFLOW:
 * 1. Reception selects slot → booking created with booking_status='draft', hold_expires_at=NOW+10min
 * 2. Reception should verify payment within 10 minutes
 * 3. After 10 min: booking shows in this "pending" list
 * 4. Reception must click [Verify] or [Release]
 *
 * Response: {
 *   success: boolean,
 *   data: [{
 *     id: number,
 *     client: { id, name },
 *     therapist: { id, name },
 *     session_date: ISO string,
 *     start_time: string (HH:MM),
 *     hold_expires_at: ISO string,
 *     created_at: ISO string
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  const auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    console.log('[pending-verifications GET] Fetching pending verification bookings...');

    // Query for draft bookings where hold has expired (NOW > hold_expires_at)
    // AND payment has not been verified yet (payment_status != 'paid')
    const { data: pendingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_id,
        therapist_id,
        session_date,
        start_time,
        payment_status,
        hold_expires_at,
        created_at,
        clients:client_id (id, name),
        therapists:therapist_id (id, name)
      `)
      .eq('booking_status', 'draft')
      .lt('hold_expires_at', new Date().toISOString()) // Hold expired (NOW > hold_expires_at)
      .neq('payment_status', 'paid'); // Payment not yet verified

    if (bookingsError) {
      console.error('[pending-verifications GET] Database error:', bookingsError);
      throw bookingsError;
    }

    console.log('[pending-verifications GET] Found', pendingBookings?.length || 0, 'pending verifications');

    // Format response with clean structure
    const formattedData = (pendingBookings || []).map((booking: any) => ({
      id: booking.id,
      client: Array.isArray(booking.clients) ? booking.clients[0] : booking.clients,
      therapist: Array.isArray(booking.therapists) ? booking.therapists[0] : booking.therapists,
      session_date: booking.session_date,
      start_time: booking.start_time,
      hold_expires_at: booking.hold_expires_at,
      created_at: booking.created_at,
      payment_status: booking.payment_status,
    }));

    console.log('[pending-verifications GET] Returning formatted data:', {
      count: formattedData.length,
      bookings: formattedData.map(b => ({
        id: b.id,
        client: b.client?.name,
        therapist: b.therapist?.name,
        status: b.payment_status,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[pending-verifications GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}
