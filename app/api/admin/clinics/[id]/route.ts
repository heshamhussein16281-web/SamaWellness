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
    const { name, location, phone, email } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
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
