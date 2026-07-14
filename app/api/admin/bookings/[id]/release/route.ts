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
 * POST /api/admin/bookings/:id/release
 *
 * Release a draft booking slot (when payment verification times out or is manually rejected)
 *
 * WORKFLOW:
 * 1. Slot was selected and held for 10 minutes (booking_status='draft', hold_expires_at=NOW+10min)
 * 2. After 10 min expires, reception must manually verify or release
 * 3. If released: booking_status='cancelled', hold_expires_at=NULL
 * 4. Slot becomes available again for other clients
 *
 * Request: POST /api/admin/bookings/:id/release
 * Response: { success: true, data: { id, booking_status, hold_expires_at } }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'create_payment');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    console.log('[bookings release POST] Releasing draft booking:', bookingId);

    // Fetch booking to verify it's in draft state
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, booking_status, client_id, therapist_id, session_date')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking is in draft state (only draft bookings can be released)
    if (booking.booking_status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot release booking with status '${booking.booking_status}'. Only draft bookings can be released.` },
        { status: 400 }
      );
    }

    console.log('[bookings release POST] ✓ Found draft booking, proceeding with release');

    // Release the booking: set status to 'cancelled' and clear hold
    const now = new Date().toISOString();
    const { data: releasedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        hold_expires_at: null, // Clear the hold
        cancellation_reason: 'Released by reception (payment verification timeout)',
        cancelled_at: now,
        updated_at: now,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('[bookings release POST] Error releasing booking:', updateError);
      return NextResponse.json({ error: 'Failed to release booking' }, { status: 500 });
    }

    console.log('[bookings release POST] ✓ Booking released successfully', {
      bookingId: booking.id,
      client_id: booking.client_id,
      therapist_id: booking.therapist_id,
      booking_status: 'cancelled',
      hold_expires_at: 'NULL',
      message: 'Slot is now available for other clients',
    });

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'delete',
      entityType: 'booking',
      entityId: booking.id.toString(),
      entityName: `Draft booking released (verification timeout) - ${booking.session_date}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: releasedBooking,
        message: 'Slot released successfully. Now available for other clients.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[bookings release POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to release booking slot' },
      { status: 500 }
    );
  }
}
