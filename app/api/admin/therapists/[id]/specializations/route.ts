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

  if (!payload.permissions.includes('manage_therapists') && !payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions', statusCode: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * PUT /api/admin/therapists/[id]/specializations
 * Update therapist specializations (session types they can conduct)
 * Strategy: Delete existing specializations, then insert new ones
 */
export async function PUT(
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

    // Validate body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be an object' },
        { status: 400 }
      );
    }

    const { session_types, clinic_id } = body;

    // Validate required fields
    if (!Array.isArray(session_types)) {
      return NextResponse.json(
        { error: 'session_types must be an array' },
        { status: 400 }
      );
    }

    if (session_types.length === 0) {
      return NextResponse.json(
        { error: 'At least one session type is required' },
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

    // Validate all session types
    for (const sessionType of session_types) {
      if (!VALID_SESSION_TYPES.includes(sessionType)) {
        return NextResponse.json(
          { error: `Invalid session_type: ${sessionType}. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Delete existing specializations for this therapist
    // If clinic_id is provided, delete only specializations at that clinic
    // Otherwise delete all specializations for this therapist
    let deleteQuery = supabase
      .from('therapist_specializations')
      .delete()
      .eq('therapist_id', therapistId);

    const { error: deleteError } = await deleteQuery;

    if (deleteError) throw deleteError;

    // Insert new specializations
    const specializationsToInsert = session_types.map((sessionType) => ({
      therapist_id: therapistId,
      session_type: sessionType,
      is_active: true,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('therapist_specializations')
      .insert(specializationsToInsert)
      .select();

    if (insertError) throw insertError;

    // Fetch all updated specializations for this therapist
    const { data: allSpecializations, error: fetchError } = await supabase
      .from('therapist_specializations')
      .select('*')
      .eq('therapist_id', therapistId)
      .order('session_type', { ascending: true });

    if (fetchError) throw fetchError;

    return NextResponse.json(
      {
        success: true,
        data: allSpecializations || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating therapist specializations:', error);
    return NextResponse.json(
      { error: 'Failed to update specializations' },
      { status: 500 }
    );
  }
}
