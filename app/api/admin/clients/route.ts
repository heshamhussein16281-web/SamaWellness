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
        payment_verified_1,
        payment_amount_1,
        payment_verified_2,
        payment_amount_2,
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

      let basicQuery = supabase
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
          total_payment_due
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (statusFilter) {
        basicQuery = basicQuery.eq('status', statusFilter);
      }
      if (phoneFilter) {
        basicQuery = basicQuery.ilike('phone', `%${phoneFilter}%`);
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

    // Fetch therapist names and rates (important: use CURRENT rates, not stored values)
    let therapistMap: Record<number, { name: string; hourly_rate: number | null }> = {};
    if (therapistIds.length > 0) {
      const { data: therapists } = await supabase
        .from('therapists')
        .select('id, name, hourly_rate')
        .in('id', therapistIds);

      if (therapists) {
        therapistMap = Object.fromEntries(
          therapists.map((t: any) => [t.id, { name: t.name, hourly_rate: t.hourly_rate || 2000 }])
        );
      }
    }

    // Format response
    const formattedClients = (clients || []).map((client: any) => {
      // Use therapist's CURRENT hourly_rate if available, otherwise use stored value
      const therapistInfo = client.therapist_id ? therapistMap[client.therapist_id] : null;
      const currentTherapistRate = therapistInfo?.hourly_rate || client.total_payment_due || null;

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
        therapist_name: therapistInfo?.name || null,
      };

      // Include payment fields only if they exist in the database
      if (paymentFieldsAvailable) {
        return {
          ...baseClient,
          payment_verified_1: client.payment_verified_1 || false,
          payment_amount_1: client.payment_amount_1 || null,
          payment_verified_2: client.payment_verified_2 || false,
          payment_amount_2: client.payment_amount_2 || null,
          total_payment_due: currentTherapistRate, // Use CURRENT therapist rate
        };
      }

      return {
        ...baseClient,
        total_payment_due: currentTherapistRate, // Even in fallback, include current rate
      };
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
