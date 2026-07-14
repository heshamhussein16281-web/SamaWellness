import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { getServiceClient } from '@/lib/supabase-service';

async function authenticate(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);
  if (!token) return null;
  return await verifyJWT(token);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('session_date', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('GET /api/clinic/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const body = await request.json();
    const { client_id, therapist_id, session_date, duration_minutes, status, notes, force_hold } = body;

    // Check if client is new
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('is_new_client')
      .eq('id', client_id)
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Determine booking status
    let bookingStatus = status;
    let holdCreatedAt = null;
    let holdExpiresAt = null;

    if (clientData.is_new_client && !force_hold) {
      // New clients without force_hold cannot create bookings
      return NextResponse.json(
        { error: 'Payment verification required before booking. New client bookings must be held and confirmed.' },
        { status: 403 }
      );
    }

    if (clientData.is_new_client && force_hold) {
      // Create draft booking for new client (10-minute hold per Phase 2 slot hold system)
      bookingStatus = 'draft'; // Draft status with hold
      holdCreatedAt = new Date().toISOString();
      holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    }

    const bookingData = {
      client_id,
      therapist_id,
      session_date,
      duration_minutes,
      booking_status: bookingStatus,
      payment_status: 'pending',
      notes,
      hold_created_at: holdCreatedAt,
      hold_expires_at: holdExpiresAt
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If hold created, add to pending_expiry tracking
    if (bookingStatus === 'H') {
      await supabase
        .from('pending_expiry')
        .insert([{
          booking_id: data[0].id,
          client_id,
          status: 'awaiting_confirmation'
        }]);
    }

    return NextResponse.json({ data: data[0], booking_status: bookingStatus }, { status: 201 });
  } catch (error) {
    console.error('POST /api/clinic/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
