import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { getServiceClient } from '@/lib/supabase-service';

async function authenticate(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);
  if (!token) return null;
  return await verifyJWT(token);
}

/**
 * GET: Retrieve all bookings with pending expiry
 * Returns holds that are awaiting confirmation before auto-cancel
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();

    // Get all pending expiry bookings
    const { data: pendingExpiries, error } = await supabase
      .from('pending_expiry')
      .select(`
        id,
        booking_id,
        client_id,
        created_at,
        status,
        notified_at,
        bookings:booking_id (
          id,
          status,
          session_date,
          hold_created_at,
          hold_expires_at,
          therapist_id,
          clients:client_id (
            id,
            name
          ),
          therapists:therapist_id (
            name
          )
        ),
        clients (
          name
        )
      `)
      .eq('status', 'awaiting_confirmation')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only those within expiry window (23h+ after creation)
    const now = Date.now();
    const expiringBookings = pendingExpiries
      .map(expiry => {
        const booking = expiry.bookings as any;
        const clientsArray = expiry.clients as any[];
        const clientName = (clientsArray && clientsArray[0]?.name) || booking.clients?.[0]?.name || 'Unknown';
        const createdTime = new Date(expiry.created_at).getTime();
        const hoursHeld = (now - createdTime) / (1000 * 60 * 60);
        const timeUntilExpiry = 24 - hoursHeld;

        return {
          pending_expiry_id: expiry.id,
          booking_id: booking.id,
          client_id: expiry.client_id,
          client_name: clientName,
          therapist_name: booking.therapists?.name || 'Unknown',
          session_date: booking.session_date,
          hold_created_at: booking.hold_created_at,
          hold_expires_at: booking.hold_expires_at,
          hours_held: Math.round(hoursHeld * 10) / 10,
          time_until_expiry_hours: Math.round(timeUntilExpiry * 10) / 10,
          needs_confirmation: timeUntilExpiry <= 0, // Past 24h
          notification_sent: !!expiry.notified_at,
          status: booking.status
        };
      })
      .sort((a, b) => a.time_until_expiry_hours - b.time_until_expiry_hours);

    return NextResponse.json({
      data: expiringBookings,
      count: expiringBookings.length,
      urgent_count: expiringBookings.filter(b => b.needs_confirmation).length
    });
  } catch (error) {
    console.error('GET /api/clinic/bookings/check-expiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: Mark pending expiries as notified
 * Called when notification is sent to reception
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const body = await request.json();
    const { pending_expiry_ids } = body;

    if (!pending_expiry_ids || !Array.isArray(pending_expiry_ids)) {
      return NextResponse.json(
        { error: 'pending_expiry_ids must be an array' },
        { status: 400 }
      );
    }

    // Mark all as notified
    const { error } = await supabase
      .from('pending_expiry')
      .update({ notified_at: new Date().toISOString() })
      .in('id', pending_expiry_ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_count: pending_expiry_ids.length });
  } catch (error) {
    console.error('POST /api/clinic/bookings/check-expiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
