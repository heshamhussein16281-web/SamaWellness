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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if user has manage_clients OR view_clients permission
  let auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    auth = await checkPermission(request, 'view_clients');
  }
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
      notes,
    } = body;

    // Build update object - only fields that exist in clients table
    const updateData: any = {};
    if (therapist_id !== undefined) updateData.therapist_id = therapist_id;
    if (status !== undefined) updateData.status = status;
    if (payment_verified !== undefined) updateData.payment_verified = payment_verified;
    if (payment_date !== undefined) updateData.payment_date = payment_date;
    if (notes !== undefined) updateData.notes = notes;

    console.log('Updating client', clientId, 'with:', JSON.stringify(updateData));

    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update client: ' + (updateError.message || 'Unknown error')
      }, { status: 500 });
    }

    console.log('Successfully updated client:', clientId);

    // Log audit action
    try {
      await logAuditAction({
        adminId: auth.user.userId,
        action: 'update',
        entityType: 'client',
        entityId: clientId.toString(),
        entityName: `Client ID ${clientId}`,
      });
    } catch (auditError) {
      console.error('Audit log failed:', auditError);
    }

    return NextResponse.json(
      { success: true, data: updatedClient },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown')
    }, { status: 500 });
  }
}
