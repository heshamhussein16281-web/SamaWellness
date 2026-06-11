import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Valid client status enum values
const VALID_STATUSES = [
  'intake',
  'assessment_pending',
  'ready_for_booking',
  'booking_scheduled',
  'payment_pending',
  'active',
  'completed',
  'inactive',
  'booking_expired',
] as const;

type ClientStatus = (typeof VALID_STATUSES)[number];

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
 * PUT /api/admin/clients/[id]/status - Update client status
 * Body: {new_status (string from 9 enum values), reason? (optional)}
 * Valid statuses: intake, assessment_pending, ready_for_booking, booking_scheduled,
 *                 payment_pending, active, completed, inactive, booking_expired
 * Logic:
 *   1. Validate new_status is in enum
 *   2. Update client.status
 *   3. Create client_status_history entry with old/new status + reason
 *   4. Return updated client
 * Response: {success, data: {id, status, updated_at}}
 * Status: 200, 400/401/403/404/500 on error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { new_status, reason } = body;

    // Validate new_status is provided
    if (!new_status) {
      return NextResponse.json(
        { error: 'new_status is required' },
        { status: 400 }
      );
    }

    // Validate new_status is in enum
    if (!VALID_STATUSES.includes(new_status as ClientStatus)) {
      return NextResponse.json(
        {
          error: `Invalid new_status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Parse client ID
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
    }

    // Fetch client to verify it exists and get current status
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, status')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if status is actually changing
    if (client.status === new_status) {
      return NextResponse.json(
        { error: `Client status is already '${new_status}'` },
        { status: 400 }
      );
    }

    // Update client status
    const now = new Date().toISOString();
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        status: new_status,
        updated_at: now,
      })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client status:', updateError);
      return NextResponse.json({ error: 'Failed to update client status' }, { status: 500 });
    }

    // Create status history entry
    const { error: historyError } = await supabase
      .from('client_status_history')
      .insert([
        {
          client_id: clientId,
          old_status: client.status,
          new_status: new_status,
          changed_by_user_id: auth.user.userId,
          reason: reason || null,
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
      action: 'update',
      entityType: 'client',
      entityId: clientId.toString(),
      entityName: `Status changed: ${client.status} → ${new_status}${reason ? ` (${reason})` : ''}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedClient.id,
          status: updatedClient.status,
          updated_at: updatedClient.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/admin/clients/[id]/status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
