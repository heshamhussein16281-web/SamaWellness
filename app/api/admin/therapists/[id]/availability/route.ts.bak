import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Valid days of week
const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Valid session statuses
const VALID_STATUSES = ['working', 'vacation', 'off'];

/**
 * Validate time format (HH:MM)
 */
function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Check admin permission for therapist management
 */
async function checkAdminPermission(
  request: NextRequest
): Promise<
  | { authorized: false; error: string; statusCode: number }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found', statusCode: 401 };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token', statusCode: 401 };
  }

  if (!payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions', statusCode: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * GET /api/admin/therapists/[id]/availability
 * Retrieve availability slots for a therapist at a specific clinic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const therapistId = params.id;

    // Get clinic_id from query params
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify therapist exists
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Fetch availability slots
    const { data: availability, error } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('clinic_id', clinicId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: availability || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching therapist availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/therapists/[id]/availability
 * Create or update availability slots for a therapist
 * Strategy: Delete existing slots for each day, then insert new ones
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const therapistId = params.id;
    const body = await request.json();

    // Validate body is array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array of availability slots' },
        { status: 400 }
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { error: 'At least one availability slot is required' },
        { status: 400 }
      );
    }

    // Verify therapist exists
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Validate all slots
    const clinicIds = new Set<string>();
    const daysToDelete = new Map<string, Set<string>>(); // clinicId -> Set of days

    for (const slot of body) {
      const { day_of_week, start_time, end_time, clinic_id, status } = slot;

      // Validate required fields
      if (!day_of_week || !start_time || !end_time || clinic_id === undefined) {
        return NextResponse.json(
          { error: 'Each slot must include day_of_week, start_time, end_time, and clinic_id' },
          { status: 400 }
        );
      }

      // Validate day_of_week
      if (!VALID_DAYS.includes(day_of_week)) {
        return NextResponse.json(
          { error: `Invalid day_of_week: ${day_of_week}. Must be ${VALID_DAYS.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate time format
      if (!validateTimeFormat(start_time)) {
        return NextResponse.json(
          { error: `Invalid start_time: ${start_time}. Format must be HH:MM` },
          { status: 400 }
        );
      }

      if (!validateTimeFormat(end_time)) {
        return NextResponse.json(
          { error: `Invalid end_time: ${end_time}. Format must be HH:MM` },
          { status: 400 }
        );
      }

      // Validate time order
      if (start_time >= end_time) {
        return NextResponse.json(
          { error: 'start_time must be before end_time' },
          { status: 400 }
        );
      }

      // Validate status if provided
      if (status && !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      clinicIds.add(String(clinic_id));

      // Track days to delete per clinic
      const key = String(clinic_id);
      if (!daysToDelete.has(key)) {
        daysToDelete.set(key, new Set());
      }
      daysToDelete.get(key)!.add(day_of_week);
    }

    // Delete existing availability for the days being updated
    const deleteEntries = Array.from(daysToDelete.entries());
    for (const [clinicId, days] of deleteEntries) {
      const { error: deleteError } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistId)
        .eq('clinic_id', clinicId)
        .in('day_of_week', Array.from(days));

      if (deleteError) throw deleteError;
    }

    // Insert new availability slots
    const slotsToInsert = body.map((slot) => ({
      therapist_id: therapistId,
      clinic_id: slot.clinic_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: slot.status || 'working',
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('therapist_availability')
      .insert(slotsToInsert)
      .select();

    if (insertError) throw insertError;

    // Fetch all updated availability for this therapist
    const { data: allAvailability, error: fetchError } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .in('clinic_id', Array.from(clinicIds))
      .order('day_of_week', { ascending: true });

    if (fetchError) throw fetchError;

    return NextResponse.json(
      {
        success: true,
        data: allAvailability || [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating therapist availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
