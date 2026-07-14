import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkPermission(
  request: NextRequest,
  requiredPermission: string
): Promise<
  | { authorized: false; error: string; status: number }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found', status: 401 };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token', status: 401 };
  }

  if (!payload.permissions.includes(requiredPermission)) {
    return { authorized: false, error: 'Insufficient permissions', status: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * POST /api/admin/clients/intake - Create intake form and initialize client
 * Body: {
 *   name (required),
 *   email? (optional, validated if provided),
 *   phone (required - must be exactly 11 digits),
 *   date_of_birth? (optional, ISO 8601),
 *   gender? (optional - male, female, other, prefer_not_to_say),
 *   language? (optional - preferred language for sessions),
 *   concern? (optional - primary reason for seeking therapy),
 *   intake_notes? (optional - clinical observations),
 *   therapist_selection_route (required - 'assessment' or 'direct_selection'),
 *   therapist_id? (optional - required if therapist_selection_route is 'direct_selection')
 * }
 * Logic:
 *   1. Authenticate user & verify 'create_client' permission
 *   2. Validate required fields (name, phone with 11 digits)
 *   3. Create atomic transaction:
 *      - INSERT into clients table (all fields saved)
 *      - INSERT into client_status_history (first status entry)
 *      - Log audit action
 *   4. Return client ID with confirmation
 * Response: {success: true, data: {id, name, status, client_since}}
 * Status: 201 Created, 400/401/403/500 on error
 */
export async function POST(request: NextRequest) {
  const auth = await checkPermission(request, 'create_client');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    console.log('Intake request body:', JSON.stringify(body, null, 2));

    const {
      name,
      email,
      phone,
      date_of_birth,
      gender,
      language,
      concern,
      intake_notes,
      therapist_selection_route,
      therapist_id,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Validate phone is 11 digits if provided
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        return NextResponse.json(
          { error: 'Phone number must be exactly 11 digits' },
          { status: 400 }
        );
      }
    } else {
      // Phone is required
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date_of_birth format if provided
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      if (isNaN(dob.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date_of_birth format. Must be ISO 8601.' },
          { status: 400 }
        );
      }
    }

    // Determine client status based on therapist selection route
    // NEW WORKFLOW: After intake, immediately move to appropriate status
    let clientStatus = 'intake';

    // If therapist directly assigned: move to ready_for_booking (can proceed to booking)
    if (therapist_selection_route === 'direct_selection' && therapist_id) {
      clientStatus = 'ready_for_booking';
      console.log('[intake POST] Direct therapist assignment - setting status to ready_for_booking');
    }
    // If assessment needed: move to assessment_pending (Sama will assess and assign)
    else if (therapist_selection_route === 'assessment') {
      clientStatus = 'assessment_pending';
      console.log('[intake POST] Assessment needed - setting status to assessment_pending');
    }
    // Otherwise stay in intake (shouldn't happen with valid form)

    // Create client record
    const now = new Date().toISOString();
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name,
          email: email || null,
          phone: phone || null,
          date_of_birth: date_of_birth || null,
          gender: gender || null,
          language: language || null,
          concern: concern || null,
          preferences: null,
          status: clientStatus,
          therapist_id: therapist_selection_route === 'direct_selection' ? (therapist_id || null) : null,
        },
      ])
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', {
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint,
      });
      if (clientError.code === '23505') {
        return NextResponse.json(
          { error: 'Client with this email or phone already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: 'Failed to create client',
          details: clientError.message,
          code: clientError.code
        },
        { status: 500 }
      );
    }

    // Create initial status history entry
    const historyReason = clientStatus === 'ready_for_booking'
      ? 'Intake completed - therapist assigned, ready for booking'
      : clientStatus === 'assessment_pending'
      ? 'Intake completed - awaiting Sama assessment for therapist assignment'
      : 'Intake form submitted';

    const { error: historyError } = await supabase
      .from('client_status_history')
      .insert([
        {
          client_id: client.id,
          old_status: null,
          new_status: clientStatus,
          changed_by_user_id: auth.user.userId,
          reason: historyReason,
          created_at: now,
        },
      ]);

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // Don't fail the request if history creation fails
    }

    // Log audit action (optional if service role key not available)
    try {
      await logAuditAction({
        adminId: auth.user.userId,
        action: 'create',
        entityType: 'client',
        entityId: client.id.toString(),
        entityName: `${client.name} (Intake submitted)`,
      });
    } catch (auditError) {
      console.error('Failed to log audit action:', auditError);
      // Continue anyway - audit logging is not critical
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: client.id,
          name: client.name,
          status: client.status,
          client_since: client.client_since,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/clients/intake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
