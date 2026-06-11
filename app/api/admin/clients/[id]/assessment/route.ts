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
 * PUT /api/admin/clients/[id]/assessment - Log assessment result
 * Body: {assessment_date (ISO), assigned_therapist_id (BIGINT)?, assessment_notes? (optional TEXT)}
 * Logic:
 *   1. Verify client exists
 *   2. If assigned_therapist_id provided: set client.therapist_id + status='ready_for_booking'
 *   3. If no therapist: status='assessment_pending' (waiting for Sama assessment)
 *   4. Create entry in client_status_history with reason='Assessment completed'
 *   5. Return updated client
 * Response: {success, data: {id, status, therapist_id, assessment_date}}
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
    const { assessment_date, assigned_therapist_id, assessment_notes } = body;

    // Validate assessment_date
    if (!assessment_date) {
      return NextResponse.json(
        { error: 'assessment_date is required' },
        { status: 400 }
      );
    }

    // Validate ISO date format
    const assessmentDateObj = new Date(assessment_date);
    if (isNaN(assessmentDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid assessment_date format. Must be ISO 8601.' },
        { status: 400 }
      );
    }

    // Parse client ID
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
    }

    // Fetch client to verify it exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, status, therapist_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Validate assigned_therapist_id format if provided
    let therapistId: number | null = null;
    let newStatus: string;

    if (assigned_therapist_id !== null && assigned_therapist_id !== undefined) {
      therapistId = parseInt(assigned_therapist_id, 10);
      if (isNaN(therapistId)) {
        return NextResponse.json(
          { error: 'Invalid assigned_therapist_id format' },
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
        return NextResponse.json({ error: 'Assigned therapist not found' }, { status: 404 });
      }

      newStatus = 'ready_for_booking';
    } else {
      newStatus = 'assessment_pending';
    }

    // Update client: set status and optionally therapist_id
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (therapistId !== null) {
      updateData.therapist_id = therapistId;
    }

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

    // Create status history entry
    const now = new Date().toISOString();
    const { error: historyError } = await supabase
      .from('client_status_history')
      .insert([
        {
          client_id: clientId,
          old_status: client.status,
          new_status: newStatus,
          changed_by_user_id: auth.user.userId,
          reason: `Assessment completed${therapistId ? ` - Assigned to therapist ${therapistId}` : ' - Pending Sama assignment'}`,
          created_at: now,
        },
      ]);

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // Don't fail the request if history creation fails
    }

    // Log audit action
    const actionDesc = `Assessment logged for client ${clientId}` +
      (therapistId ? ` - Assigned to therapist ${therapistId}` : ' - Pending assignment');

    await logAuditAction({
      adminId: auth.user.userId,
      action: 'update',
      entityType: 'client',
      entityId: clientId.toString(),
      entityName: actionDesc,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedClient.id,
          status: updatedClient.status,
          therapist_id: updatedClient.therapist_id,
          assessment_date: assessment_date,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/admin/clients/[id]/assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
