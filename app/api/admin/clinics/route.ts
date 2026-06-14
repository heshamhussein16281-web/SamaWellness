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
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ clinics: clinics || [] });
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
    const { name, location, phone, email } = body;

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

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    );
  }
}
