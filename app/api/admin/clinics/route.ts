import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkAdminPermission(
  request: NextRequest
): Promise<
  | { authorized: false; error: string }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found' };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  if (!payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true, user: payload };
}

// GET: List all clinics
export async function GET(request: NextRequest) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select(`
        *,
        clinic_rooms(room_name)
      `)
      .order('name');

    if (error) throw error;

    // Transform clinic_rooms array to rooms array with just names
    const transformedClinics = (clinics || []).map((clinic: any) => ({
      ...clinic,
      rooms: clinic.clinic_rooms ? clinic.clinic_rooms.map((r: any) => r.room_name) : []
    }));

    return NextResponse.json({ clinics: transformedClinics });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

// POST: Create new clinic
export async function POST(request: NextRequest) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, location, phone, email, rooms } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Clinic name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert([
        {
          name,
          location: location || null,
          phone: phone || null,
          email: email || null,
        },
      ])
      .select();

    if (error) {
      if (error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'A clinic with this name already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    const clinic = data[0];

    // Save rooms if provided
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      const roomsToInsert = rooms
        .filter((name: string) => name && name.trim()) // Only save non-empty room names
        .map((name: string) => ({
          clinic_id: clinic.id,
          room_name: name.trim(),
          room_type: 'standard',
          capacity: 1,
        }));

      if (roomsToInsert.length > 0) {
        const { error: roomError } = await supabase
          .from('clinic_rooms')
          .insert(roomsToInsert);

        if (roomError) {
          console.error('Error saving rooms:', roomError);
          // Don't fail the clinic creation if rooms fail
        }
      }
    }

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
