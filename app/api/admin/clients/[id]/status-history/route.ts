import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

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
 * GET /api/admin/clients/[id]/status-history - Get status change audit trail
 * Query: page (default 1), limit (default 20)
 * Returns: array of {created_at, old_status, new_status, changed_by, reason}
 * Status: 200, 401/403/404/500 on error
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
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    // Parse client ID
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
    }

    // Get total count of status history records
    const { count: totalCount, error: countError } = await supabase
      .from('client_status_history')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId);

    if (countError) {
      console.error('Error counting status history:', countError);
      return NextResponse.json({ error: 'Failed to fetch status history count' }, { status: 500 });
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch status history with user who made the change
    const { data: history, error } = await supabase
      .from('client_status_history')
      .select(`
        created_at,
        old_status,
        new_status,
        reason,
        changed_by_user_id,
        clinic_users:changed_by_user_id (id, username, email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching status history:', error);
      return NextResponse.json({ error: 'Failed to fetch status history' }, { status: 500 });
    }

    // Format response with user names
    const formattedHistory = (history || []).map((record: any) => {
      const changedByUser = Array.isArray(record.clinic_users)
        ? record.clinic_users[0]
        : record.clinic_users;

      return {
        created_at: record.created_at,
        old_status: record.old_status,
        new_status: record.new_status,
        changed_by: changedByUser?.username || changedByUser?.email || null,
        reason: record.reason || null,
      };
    });

    return NextResponse.json(
      {
        data: formattedHistory,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/clients/[id]/status-history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
