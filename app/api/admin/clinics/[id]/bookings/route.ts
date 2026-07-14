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
 * GET /api/admin/clinics/[id]/bookings
 * Get all bookings for a specific clinic (by any therapist)
 * Optional query: date=YYYY-MM-DD to filter by date
 * Used by BookingCalendarModal to check room conflicts across all therapists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkPermission(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clinicId = parseInt(params.id, 10);
    if (isNaN(clinicId)) {
      return NextResponse.json({ error: 'Invalid clinic ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabase
      .from('bookings')
      .select('id, therapist_id, session_date, duration_minutes, booking_status, client_id, room_id')
      .eq('clinic_id', clinicId)
      .in('booking_status', ['draft', 'scheduled', 'confirmed']);

    // Filter by date if provided
    if (date) {
      query = query
        .gte('session_date', `${date}T00:00:00`)
        .lt('session_date', `${date}T23:59:59`);
    }

    const { data: bookings, error } = await query.order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching clinic bookings:', error);
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
    console.error('GET /api/admin/clinics/[id]/bookings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
