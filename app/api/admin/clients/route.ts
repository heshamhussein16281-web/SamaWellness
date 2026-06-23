import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { checkUserPermission } from '@/lib/permission-check';
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

  // Check permission dynamically from database (real-time)
  const hasPermission = await checkUserPermission(payload.userId, requiredPermission);
  if (!hasPermission) {
    return { authorized: false, error: 'Insufficient permissions', status: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * GET /api/admin/clients - Get list of all clients
 * Query: page (default 1), limit (default 20), status (optional filter)
 * Returns: array of {id, name, email, phone, status, client_since, therapist_name}
 * Status: 200, 401/403/500 on error
 */
export async function GET(request: NextRequest) {
  unstable_noStore();

  const auth = await checkPermission(request, 'view_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10))); // Default to 10 to match frontend
    const statusFilter = searchParams.get('status');
    const phoneFilter = searchParams.get('phone');

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get total count
    let countQuery = supabase
      .from('clients')
      .select('id', { count: 'exact' });

    if (statusFilter) {
      countQuery = countQuery.eq('status', statusFilter);
    }

    if (phoneFilter) {
      countQuery = countQuery.ilike('phone', `%${phoneFilter}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    console.log('[GET /api/admin/clients] Count query result:', {
      totalCount,
      countError: countError?.message,
      statusFilter,
      phoneFilter,
    });

    if (countError) {
      console.error('Error counting clients:', countError);
      return NextResponse.json({ error: 'Failed to fetch clients count' }, { status: 500 });
    }

    // Fetch clients with therapist names and payment info
    // Try to select payment fields, fallback to basic fields if they don't exist
    let dataQuery = supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        status,
        client_since,
        therapist_id,
        is_recurring,
        total_sessions_completed,
        assessment_payment_verified,
        assessment_payment_amount,
        therapist_fee_payment_verified,
        therapist_fee_payment_amount,
        total_payment_due
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Track if payment fields are available
    let paymentFieldsAvailable = true;

    if (statusFilter) {
      dataQuery = dataQuery.eq('status', statusFilter);
    }

    if (phoneFilter) {
      dataQuery = dataQuery.ilike('phone', `%${phoneFilter}%`);
    }

    let clients, error;
    ({ data: clients, error } = await dataQuery);

    // If the query fails (likely due to missing payment columns), try without those fields
    if (error && error.message?.includes('column')) {
      console.warn('Payment fields not available, retrying without them:', error.message);
      paymentFieldsAvailable = false;

      const basicQuery = supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          status,
          client_since,
          therapist_id,
          is_recurring,
          total_sessions_completed
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (statusFilter) {
        basicQuery.eq('status', statusFilter);
      }
      if (phoneFilter) {
        basicQuery.ilike('phone', `%${phoneFilter}%`);
      }

      ({ data: clients, error } = await basicQuery);
    }

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    // Get therapist IDs for lookup
    const therapistIds = (clients || [])
      .map((c: any) => c.therapist_id)
      .filter((id: any) => id !== null && id !== undefined);

    // Fetch therapist names if needed
    let therapistMap: Record<number, string> = {};
    if (therapistIds.length > 0) {
      const { data: therapists } = await supabase
        .from('therapists')
        .select('id, name')
        .in('id', therapistIds);

      if (therapists) {
        therapistMap = Object.fromEntries(
          therapists.map((t: any) => [t.id, t.name])
        );
      }
    }

    // Format response
    const formattedClients = (clients || []).map((client: any) => {
      const baseClient = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        client_since: client.client_since,
        therapist_id: client.therapist_id || null,
        is_recurring: client.is_recurring || false,
        total_sessions_completed: client.total_sessions_completed || 0,
        therapist_name: client.therapist_id ? (therapistMap[client.therapist_id] || null) : null,
      };

      // Include payment fields only if they exist in the database
      if (paymentFieldsAvailable) {
        return {
          ...baseClient,
          assessment_payment_verified: client.assessment_payment_verified || false,
          assessment_payment_amount: client.assessment_payment_amount || null,
          therapist_fee_payment_verified: client.therapist_fee_payment_verified || false,
          therapist_fee_payment_amount: client.therapist_fee_payment_amount || null,
          total_payment_due: client.total_payment_due || null,
        };
      }

      return baseClient;
    });

    return NextResponse.json(
      {
        data: formattedClients,
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
    console.error('GET /api/admin/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
