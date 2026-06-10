import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { getServiceClient } from '@/lib/supabase-service';

async function authenticate(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);
  if (!token) return null;
  return await verifyJWT(token);
}

interface ConfirmExpiryRequest {
  booking_id: string;
  action: 'payment_confirmed' | 'cancel';
  confirmed_by?: string;
}

/**
 * POST: Confirm expiry action (payment or cancellation)
 * Called when receptionist clicks button on modal
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const body: ConfirmExpiryRequest = await request.json();
    const { booking_id, action, confirmed_by } = body;

    if (!booking_id || !action) {
      return NextResponse.json(
        { error: 'booking_id and action are required' },
        { status: 400 }
      );
    }

    if (!['payment_confirmed', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "payment_confirmed" or "cancel"' },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'H') {
      return NextResponse.json(
        { error: 'Only hold bookings can be confirmed' },
        { status: 400 }
      );
    }

    if (action === 'payment_confirmed') {
      // Convert hold to paid (BP)
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'BP',
          paid_at: new Date().toISOString(),
          hold_created_at: null,
          hold_expires_at: null,
          expiry_confirmed_at: new Date().toISOString(),
          expiry_confirmed_by: confirmed_by || 'unknown'
        })
        .eq('id', booking_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Mark client as no longer new (they've completed first booking)
      await supabase
        .from('clients')
        .update({
          is_new_client: false,
          first_booking_completed_at: new Date().toISOString()
        })
        .eq('id', booking.client_id);

      // Remove from pending expiry
      await supabase
        .from('pending_expiry')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('booking_id', booking_id);

      return NextResponse.json({
        success: true,
        action: 'payment_confirmed',
        booking_id,
        new_status: 'BP',
        message: 'Booking confirmed as paid'
      });

    } else if (action === 'cancel') {
      // Cancel the booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          expiry_confirmed_at: new Date().toISOString(),
          expiry_confirmed_by: confirmed_by || 'unknown'
        })
        .eq('id', booking_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Remove from pending expiry
      await supabase
        .from('pending_expiry')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('booking_id', booking_id);

      return NextResponse.json({
        success: true,
        action: 'cancel',
        booking_id,
        new_status: 'cancelled',
        message: 'Booking cancelled and slot released'
      });
    }

  } catch (error) {
    console.error('POST /api/clinic/bookings/confirm-expiry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
