import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkSuperAdminPermission(
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

  if (!payload.is_super_admin) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true, user: payload };
}

export async function GET(request: NextRequest) {
  try {
    // Verify super-admin
    const auth = await checkSuperAdminPermission(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const supabase = getServiceClient();
    const url = new URL(request.url);

    // Parse query parameters
    const adminId = url.searchParams.get('admin_id');
    const action = url.searchParams.get('action');
    const entityType = url.searchParams.get('entity_type');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10))
    );

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(
        `
        id,
        admin_id,
        clinic_users(username),
        action,
        entity_type,
        entity_id,
        entity_name,
        changes,
        created_at
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (adminId) query = query.eq('admin_id', adminId);
    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    // Apply pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Audit logs query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    // Format response
    const formattedData = (data || []).map((log: any) => ({
      id: log.id,
      admin_id: log.admin_id,
      admin_name: log.clinic_users?.username || 'Unknown',
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      entity_name: log.entity_name,
      changes: log.changes,
      timestamp: log.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
