import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkTherapistPermission(
  request: NextRequest,
  requiredPermission: 'view_therapists' | 'manage_therapists' = 'view_therapists'
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

  // Check for required permission or admin access
  if (!payload.permissions.includes(requiredPermission) && !payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions for therapist management' };
  }

  return { authorized: true, user: payload };
}

// GET: Fetch single therapist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkTherapistPermission(request, 'view_therapists');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { data: therapist, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !therapist) {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(therapist);
  } catch (error) {
    console.error('Error fetching therapist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapist' },
      { status: 500 }
    );
  }
}

// PUT: Update therapist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkTherapistPermission(request, 'manage_therapists');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, hourly_rate, specializations } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;
    if (specializations !== undefined) updateData.specializations = specializations;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('therapists')
      .update(updateData)
      .eq('id', params.id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to update therapist' },
      { status: 500 }
    );
  }
}

// DELETE: Delete therapist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkTherapistPermission(request, 'manage_therapists');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { error } = await supabase
      .from('therapists')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    return NextResponse.json(
      { error: 'Failed to delete therapist' },
      { status: 500 }
    );
  }
}
