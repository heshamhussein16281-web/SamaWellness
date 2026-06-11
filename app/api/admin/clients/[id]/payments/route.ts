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
 * GET /api/admin/clients/[id]/payments - Get payment history for a client
 * Query: page (default 1), limit (default 20)
 * Returns: array of {payment_date, amount_paid, actual_cost, refund_amount, additional_charge, charge_status, marked_by}
 * Status: 200, 401/403/404/500 on error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'view_payments');
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

    // Get total count of payment records
    const { count: totalCount, error: countError } = await supabase
      .from('payment_records')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId);

    if (countError) {
      console.error('Error counting payments:', countError);
      return NextResponse.json({ error: 'Failed to fetch payments count' }, { status: 500 });
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch payment records with user who marked payment
    const { data: payments, error } = await supabase
      .from('payment_records')
      .select(`
        payment_date,
        amount_paid,
        actual_cost,
        refund_amount,
        additional_charge,
        charge_status,
        marked_by_user_id,
        clinic_users:marked_by_user_id (id, username, email)
      `)
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    // Format response with user names
    const formattedPayments = (payments || []).map((payment: any) => {
      const markedByUser = Array.isArray(payment.clinic_users)
        ? payment.clinic_users[0]
        : payment.clinic_users;

      return {
        payment_date: payment.payment_date,
        amount_paid: payment.amount_paid,
        actual_cost: payment.actual_cost,
        refund_amount: payment.refund_amount,
        additional_charge: payment.additional_charge,
        charge_status: payment.charge_status,
        marked_by: markedByUser?.username || markedByUser?.email || null,
      };
    });

    return NextResponse.json(
      {
        data: formattedPayments,
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
    console.error('GET /api/admin/clients/[id]/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
