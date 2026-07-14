import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkPermission(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) return false;

  const payload = await verifyJWT(token);
  if (!payload) return false;

  return payload.permissions.includes('view_bookings') || payload.permissions.includes('manage_users');
}

/**
 * GET /api/admin/therapists/[id]/bookings
 * Get all bookings for a specific therapist
 * Used by BookingCalendarModal to show unavailable slots
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkPermission(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const therapistId = parseInt(params.id, 10);
    if (isNaN(therapistId)) {
      return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
    }

    // Get all active bookings for this therapist
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, session_date, duration_minutes, booking_status, client_id, room_id')
      .eq('therapist_id', therapistId)
      .in('booking_status', ['draft', 'scheduled', 'confirmed'])
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching therapist bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: bookings || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/admin/therapists/[id]/bookings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
