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
 * Body: {name, email, phone, date_of_birth, gender, language, concern, referred_by?, preferences?, intake_notes?}
 * Logic:
 *   1. Create client record with status='intake'
 *   2. Store intake data in client columns + client_status_history
 *   3. Return client ID with confirmation
 * Response: {success, data: {id, name, status, client_since}}
 * Status: 201, 400/401/403/500 on error
 */
export async function POST(request: NextRequest) {
  const auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      date_of_birth,
      gender,
      language,
      concern,
      referred_by,
      preferences,
      intake_notes,
    } = body;

    // Validate required fields
    if (!name || !concern) {
      return NextResponse.json(
        { error: 'name and concern are required' },
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

    // Create client record with initial status='intake'
    const now = new Date().toISOString();
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          name,
          email: email || null,
          phone: phone || null,
          date_of_birth: date_of_birth || null,
          status: 'intake',
          client_since: now,
          notes: intake_notes || null,
          referral_source: referred_by || null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      if (clientError.code === '23505') {
        return NextResponse.json(
          { error: 'Client with this email or phone already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    // Create initial status history entry
    const { error: historyError } = await supabase
      .from('client_status_history')
      .insert([
        {
          client_id: client.id,
          old_status: null,
          new_status: 'intake',
          changed_by_user_id: auth.user.userId,
          reason: 'Client intake form submitted',
          created_at: now,
        },
      ]);

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // Don't fail the request if history creation fails
    }

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'create',
      entityType: 'client',
      entityId: client.id.toString(),
      entityName: `${client.name} (Intake submitted)`,
    });

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
