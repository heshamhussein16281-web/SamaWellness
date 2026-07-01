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
 * PATCH /api/admin/bookings/[id]/cancel - Cancel a booking
 * Body: { cancellation_reason?: string }
 * Returns: { success: true, data: booking }
 * Status: 200, 400/401/403/404/500 on error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[Cancel Booking] PATCH /api/admin/bookings/${params.id}/cancel called`);

  // Just verify user is authenticated (same as GET clinic endpoint for booking workflow)
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);
  console.log(`[Cancel Booking] Token present: ${!!token}`);

  if (!token) {
    return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { cancellation_reason } = body;

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Get current booking to check its status
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('booking_status')
      .eq('id', bookingId)
      .single();

    console.log(`[Cancel Booking] Fetch booking ${bookingId}:`, { fetchError, booking });

    if (fetchError || !booking) {
      console.error(`[Cancel Booking] Booking ${bookingId} not found`, fetchError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking can be cancelled
    const cancelledStatuses = ['cancelled', 'completed', 'expired'];
    console.log(`[Cancel Booking] Booking ${bookingId} status: ${booking.booking_status}`);

    if (cancelledStatuses.includes(booking.booking_status)) {
      console.log(`[Cancel Booking] Cannot cancel booking ${bookingId} - already ${booking.booking_status}`);
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${booking.booking_status}` },
        { status: 400 }
      );
    }

    // Update booking status to cancelled
    const now = new Date().toISOString();
    console.log(`[Cancel Booking] Attempting to cancel booking ${bookingId} for user ${payload.userId}`);

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancellation_reason: cancellation_reason || null,
        cancelled_at: now,
        updated_at: now,
      })
      .eq('id', bookingId)
      .select()
      .single();

    console.log(`[Cancel Booking] Update result:`, { updateError, booking: updatedBooking });

    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      return NextResponse.json({ error: 'Failed to cancel booking', details: updateError }, { status: 500 });
    }

    if (!updatedBooking) {
      console.error('No booking returned after update');
      return NextResponse.json({ error: 'Booking not found after update' }, { status: 500 });
    }

    console.log(`[Cancel Booking] Successfully cancelled booking ${bookingId}, new status: ${updatedBooking.booking_status}`);

    return NextResponse.json(
      { success: true, data: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH /api/admin/bookings/[id]/cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
