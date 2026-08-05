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

    console.log('[clinic bookings] Fetching for clinic:', clinicId, 'date filter:', date);

    try {
      console.log('[clinic bookings] START - clinicId:', clinicId, 'date:', date);

      // First, test query WITHOUT clinic_id filter to see if any bookings exist
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select('id, therapist_id, session_date, duration_minutes, booking_status, client_id, room_id, clinic_id')
        .in('booking_status', ['draft', 'scheduled', 'confirmed'])
        .limit(10);

      console.log('[clinic bookings] All bookings (no filter):', allBookings?.length || 0, 'error:', allError?.message);

      // Now do the actual clinic-filtered query
      let query = supabase
        .from('bookings')
        .select('id, therapist_id, session_date, duration_minutes, booking_status, client_id, room_id, clinic_id')
        .eq('clinic_id', clinicId)
        .in('booking_status', ['draft', 'scheduled', 'confirmed']);

      console.log('[clinic bookings] Query parameters:', {
        clinicId,
        clinicIdType: typeof clinicId,
        date,
        statuses: ['draft', 'scheduled', 'confirmed']
      });

      // Add date filters if provided
      if (date) {
        console.log('[clinic bookings] Adding date filter:', date);
        query = query
          .gte('session_date', `${date}T00:00:00`)
          .lt('session_date', `${date}T23:59:59`);
      }

      // Add ordering
      query = query.order('session_date', { ascending: false });

      // Execute query
      const { data: bookings, error } = await query;

      console.log('[clinic bookings] Clinic-filtered query returned:', bookings?.length || 0, 'bookings');
      if (error) {
        console.error('[clinic bookings] Query error:', error);
      }
      if (bookings && bookings.length > 0) {
        console.log('[clinic bookings] Sample booking:', {
          id: bookings[0].id,
          clinic_id: bookings[0].clinic_id,
          therapist_id: bookings[0].therapist_id,
        });
      }

      if (error) {
        throw error;
      }

      console.log('[clinic bookings] Success - returning', bookings?.length || 0, 'bookings');
      return NextResponse.json(
        {
          success: true,
          data: bookings || [],
        },
        // Live conflict data: never cache. The default route response is
        // `public, max-age=0, must-revalidate`, which lets the browser reuse a
        // stale bookings list and render already-booked rooms as free.
        { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
      );
    } catch (supabaseError: any) {
      console.error('[clinic bookings] Query error:', {
        message: supabaseError?.message,
        code: supabaseError?.code,
        details: supabaseError?.details,
      });
      return NextResponse.json({
        error: 'Failed to fetch clinic bookings',
        details: supabaseError?.message || 'Unknown error',
      }, { status: 500 });
    }
  } catch (err) {
    console.error('GET /api/admin/clinics/[id]/bookings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
