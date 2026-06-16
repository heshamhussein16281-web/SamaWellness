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
 * GET /api/admin/clients/[id] - Get client details
 * Returns: {id, name, email, phone, status, therapist_id, ...}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'view_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const clientId = parseInt(params.id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ data: client }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/clients/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/clients/[id] - Update client details
 * Body: {
 *   therapist_id? (number),
 *   status? (string),
 *   payment_verified? (boolean),
 *   payment_date? (ISO string),
 *   payment_method? (string),
 *   transaction_id? (string),
 *   notes? (string)
 * }
 * Logic:
 *   1. Authenticate & verify manage_clients permission
 *   2. Update client fields provided in body
 *   3. If status changed: create status_history entry
 *   4. Return updated client
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
    const clientId = parseInt(params.id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      therapist_id,
      status,
      payment_verified,
      payment_date,
      payment_method,
      transaction_id,
      notes,
    } = body;

    // Get current client to compare status changes
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('status')
      .eq('id', clientId)
      .single();

    if (fetchError || !currentClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (therapist_id !== undefined) updateData.therapist_id = therapist_id;
    if (status !== undefined) updateData.status = status;
    if (payment_verified !== undefined) updateData.payment_verified = payment_verified;
    if (payment_date !== undefined) updateData.payment_date = payment_date;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (transaction_id !== undefined) updateData.transaction_id = transaction_id;
    if (notes !== undefined) updateData.notes = notes;

    // Always update updated_at
    updateData.updated_at = new Date().toISOString();

    // Update client
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    // If status changed, create history entry
    if (status && status !== currentClient.status) {
      const { error: historyError } = await supabase
        .from('client_status_history')
        .insert([
          {
            client_id: clientId,
            old_status: currentClient.status,
            new_status: status,
            changed_by_user_id: auth.user.userId,
            reason: notes || `Status updated to ${status}`,
            created_at: new Date().toISOString(),
          },
        ]);

      if (historyError) {
        console.error('Error creating status history:', historyError);
        // Don't fail the request if history creation fails
      }
    }

    // Log audit action
    try {
      await logAuditAction({
        adminId: auth.user.userId,
        action: 'update',
        entityType: 'client',
        entityId: clientId.toString(),
        entityName: `Client ID ${clientId} - ${status ? `Status: ${status}` : 'Updated'}`,
      });
    } catch (auditError) {
      console.error('Failed to log audit action:', auditError);
      // Continue anyway - audit logging is not critical
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedClient,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/admin/clients/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
