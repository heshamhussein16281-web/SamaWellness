import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Valid session types
const VALID_SESSION_TYPES = ['single', 'group', 'couple'];

// Day of week mapping
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailableSlot {
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  available: boolean;
  cost: number;
  reason?: string;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Validate time format (HH:MM)
 */
function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Check admin permission
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
 * GET /api/admin/bookings/available-slots
 * Calculate available appointment slots for a therapist on a specific date
 */
export async function GET(request: NextRequest) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const therapistId = searchParams.get('therapist_id');
    const clinicId = searchParams.get('clinic_id');
    const date = searchParams.get('date');
    const sessionType = searchParams.get('session_type');
    const durationMinutesStr = searchParams.get('duration_minutes') || '60';

    // Validate required parameters
    if (!therapistId) {
      return NextResponse.json(
        { error: 'Missing required parameter: therapist_id' },
        { status: 400 }
      );
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Missing required parameter: clinic_id' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Missing required parameter: date' },
        { status: 400 }
      );
    }

    if (!sessionType) {
      return NextResponse.json(
        { error: 'Missing required parameter: session_type' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!validateDateFormat(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate session type
    if (!VALID_SESSION_TYPES.includes(sessionType)) {
      return NextResponse.json(
        { error: `Invalid session_type: ${sessionType}. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate duration_minutes
    const durationMinutes = parseInt(durationMinutesStr, 10);
    if (isNaN(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
      return NextResponse.json(
        { error: 'Invalid duration_minutes. Must be between 15 and 480' },
        { status: 400 }
      );
    }

    // Parse date to get day of week
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const dayOfWeek = DAY_NAMES[dateObj.getUTCDay()];

    // 1. Verify therapist exists and get hourly_rate
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id, hourly_rate')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    const hourlyRate = therapist.hourly_rate || 0;

    // 2. Verify therapist has specialization for this session_type
    const { data: specialization, error: specializationError } = await supabase
      .from('therapist_specializations')
      .select('id')
      .eq('therapist_id', therapistId)
      .eq('session_type', sessionType)
      .eq('is_active', true)
      .single();

    if (specializationError || !specialization) {
      return NextResponse.json(
        { error: `Therapist does not have specialization for ${sessionType} sessions` },
        { status: 400 }
      );
    }

    // 3. Get therapist availability for the clinic on this day of week
    const { data: availability, error: availabilityError } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('clinic_id', clinicId)
      .eq('day_of_week', dayOfWeek)
      .eq('status', 'working')
      .single();

    if (availabilityError || !availability) {
      return NextResponse.json(
        { error: `No availability found for therapist on ${dayOfWeek}` },
        { status: 404 }
      );
    }

    // 4. Get available rooms at clinic for this session_type
    let roomQuery = supabase
      .from('clinic_rooms')
      .select('id, name, capacity');

    // Add capacity filter based on session type
    if (sessionType === 'single') {
      roomQuery = roomQuery.gte('capacity', 1);
    } else if (sessionType === 'couple') {
      roomQuery = roomQuery.gte('capacity', 2);
    } else if (sessionType === 'group') {
      roomQuery = roomQuery.gte('capacity', 3);
    }

    const { data: rooms, error: roomsError } = await roomQuery
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (roomsError || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: 'No available rooms found for this session type at the clinic' },
        { status: 404 }
      );
    }

    // 5. Get existing bookings for therapist+clinic+date
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('therapist_id, room_id, session_date, duration_minutes, booking_status')
      .eq('therapist_id', therapistId)
      .eq('clinic_id', clinicId)
      .gte('session_date', `${date}T00:00:00`)
      .lt('session_date', `${date}T23:59:59`)
      .in('booking_status', ['scheduled', 'confirmed']);

    if (bookingsError) {
      throw bookingsError;
    }

    // Build a conflict map: room_id -> Set of minute ranges that are booked
    const bookingConflicts = new Map<string, Array<{ start: number; end: number }>>();

    for (const room of rooms) {
      bookingConflicts.set(room.id, []);
    }

    if (bookings) {
      for (const booking of bookings) {
        if (booking.room_id) {
          const bookingStart = new Date(booking.session_date);
          const startMinutes =
            bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes();
          const endMinutes = startMinutes + (booking.duration_minutes || 60);

          if (bookingConflicts.has(booking.room_id)) {
            bookingConflicts.get(booking.room_id)!.push({
              start: startMinutes,
              end: endMinutes,
            });
          }
        }
      }
    }

    // 6. Generate 30-minute slots from availability start_time to end_time
    const availStart = timeToMinutes(availability.start_time);
    const availEnd = timeToMinutes(availability.end_time);

    const slots: AvailableSlot[] = [];

    // For each room
    for (const room of rooms) {
      const conflicts = bookingConflicts.get(room.id) || [];

      // Generate 30-minute slots
      for (let slotStart = availStart; slotStart + durationMinutes <= availEnd; slotStart += 30) {
        const slotEnd = slotStart + durationMinutes;

        // Check if this slot conflicts with any booking
        let isConflict = false;
        let conflictReason = '';

        for (const booking of conflicts) {
          // Check if booking overlaps with this slot
          if (booking.start < slotEnd && booking.end > slotStart) {
            isConflict = true;
            conflictReason = 'Slot conflicts with existing booking';
            break;
          }
        }

        // Calculate cost
        const cost = (hourlyRate / 60) * durationMinutes;

        slots.push({
          start_time: minutesToTime(slotStart),
          end_time: minutesToTime(slotEnd),
          room_id: room.id,
          room_name: room.name,
          available: !isConflict,
          cost: Math.round(cost * 100) / 100,
          ...(isConflict && { reason: conflictReason }),
        });
      }
    }

    if (slots.length === 0) {
      return NextResponse.json(
        { error: 'No slots available for the requested duration within working hours' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: slots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating available slots:', error);
    return NextResponse.json(
      { error: 'Failed to calculate available slots' },
      { status: 500 }
    );
  }
}
