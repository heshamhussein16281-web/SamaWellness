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
 * GET /api/admin/therapists/[id]/exceptions
 * Fetch all exceptions for a therapist at a specific clinic
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
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id query parameter is required' },
        { status: 400 }
      );
    }

    const { data: exceptions, error } = await supabase
      .from('therapist_exceptions')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('clinic_id', clinicId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: exceptions || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching therapist exceptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/therapists/[id]/exceptions
 * Create a new exception (vacation or day off)
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
    const { clinic_id, exception_type, start_date, end_date, notes } = body;

    // Validate required fields
    if (!clinic_id || !exception_type || !start_date) {
      return NextResponse.json(
        { error: 'clinic_id, exception_type, and start_date are required' },
        { status: 400 }
      );
    }

    // Validate exception_type
    if (!['vacation', 'day_off'].includes(exception_type)) {
      return NextResponse.json(
        { error: 'exception_type must be "vacation" or "day_off"' },
        { status: 400 }
      );
    }

    // For vacation, end_date is required; for day_off, it's optional (defaults to start_date)
    const finalEndDate = end_date || (exception_type === 'day_off' ? start_date : null);

    if (exception_type === 'vacation' && !finalEndDate) {
      return NextResponse.json(
        { error: 'end_date is required for vacation exceptions' },
        { status: 400 }
      );
    }

    // Validate date order
    if (finalEndDate && start_date > finalEndDate) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('therapist_exceptions')
      .insert([
        {
          therapist_id: therapistId,
          clinic_id,
          exception_type,
          start_date,
          end_date: finalEndDate,
          notes: notes || null,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating exception:', error);
    return NextResponse.json(
      { error: 'Failed to create exception' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/therapists/[id]/exceptions/[exceptionId]
 * Delete an exception
 */
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const exceptionId = searchParams.get('exception_id');

    if (!exceptionId) {
      return NextResponse.json(
        { error: 'exception_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify the exception belongs to this therapist
    const { data: exception, error: fetchError } = await supabase
      .from('therapist_exceptions')
      .select('id')
      .eq('id', exceptionId)
      .eq('therapist_id', therapistId)
      .single();

    if (fetchError || !exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('therapist_exceptions')
      .delete()
      .eq('id', exceptionId);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      {
        success: true,
        message: 'Exception deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting exception:', error);
    return NextResponse.json(
      { error: 'Failed to delete exception' },
      { status: 500 }
    );
  }
}
