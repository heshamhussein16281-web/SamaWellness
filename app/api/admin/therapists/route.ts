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

// GET: List all therapists
export async function GET(request: NextRequest) {
  const auth = await checkTherapistPermission(request, 'view_therapists');
  if (!auth.authorized) {
    console.warn('Unauthorized therapist fetch attempt:', auth.error);
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    console.log('Fetching therapists for user:', auth.user.username);
    const { data: therapists, error } = await supabase
      .from('therapists')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Successfully fetched therapists:', therapists?.length || 0);
    return NextResponse.json({ therapists: therapists || [] });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}

// POST: Create new therapist
export async function POST(request: NextRequest) {
  const auth = await checkTherapistPermission(request, 'manage_therapists');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, hourly_rate, specializations } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('therapists')
      .insert([
        {
          name,
          email: email || null,
          hourly_rate: hourly_rate || null,
          specializations: specializations || [],
        },
      ])
      .select();

    if (error) {
      if (error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'A therapist with this name already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to create therapist' },
      { status: 500 }
    );
  }
}
