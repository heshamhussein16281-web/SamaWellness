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

// GET: Fetch single clinic
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic' },
      { status: 500 }
    );
  }
}

// PUT: Update clinic
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, location, phone, email, number_of_rooms, rooms } = body;

    // Validate number_of_rooms if provided
    if (number_of_rooms !== undefined && number_of_rooms !== null) {
      if (typeof number_of_rooms !== 'number' || number_of_rooms < 1) {
        return NextResponse.json(
          { error: 'number_of_rooms must be a number >= 1' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (number_of_rooms !== undefined) updateData.number_of_rooms = number_of_rooms;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', params.id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Update rooms if provided
    if (rooms && Array.isArray(rooms)) {
      // Delete existing rooms
      await supabase
        .from('clinic_rooms')
        .delete()
        .eq('clinic_id', params.id);

      // Insert new rooms
      const roomsToInsert = rooms
        .filter((name: string) => name && name.trim())
        .map((name: string) => ({
          clinic_id: params.id,
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
        }
      }
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    );
  }
}

// DELETE: Delete clinic
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
