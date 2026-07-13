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
 * POST /api/admin/payment-records - Create a payment record
 * Body: {client_id, payment_date, amount_paid, actual_cost?, refund_amount?, additional_charge?, charge_status?}
 * Returns: {success, data: {id, ...}}
 * Status: 201 on success, 400/401/403/500 on error
 */
export async function POST(request: NextRequest) {
  // Check if user has manage_clients OR view_payments permission
  let auth = await checkPermission(request, 'manage_clients');
  if (!auth.authorized) {
    auth = await checkPermission(request, 'view_payments');
  }
  if (!auth.authorized) {
    console.error('[POST /api/admin/payment-records] Permission denied:', {
      error: auth.error,
      status: auth.status
    });
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  console.log('[POST /api/admin/payment-records] Authorized user:', auth.user.username, 'permissions:', auth.user.permissions);

  try {
    const body = await request.json();
    const {
      client_id,
      payment_date,
      amount_paid,
      actual_cost = amount_paid,
      refund_amount = 0,
      additional_charge = 0,
      charge_status = 'completed',
    } = body;

    // Validate required fields
    if (!client_id || !payment_date || amount_paid === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, payment_date, amount_paid' },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create payment record
    console.log('[POST /api/admin/payment-records] Creating record:', {
      client_id,
      payment_date,
      amount_paid,
      actual_cost,
      refund_amount,
      additional_charge,
      charge_status,
      marked_by_user_id: auth.user.userId,
    });

    const { data: paymentRecord, error: createError } = await supabase
      .from('payment_records')
      .insert([
        {
          client_id,
          payment_date,
          amount_paid,
          actual_cost,
          refund_amount,
          additional_charge,
          charge_status,
          marked_by_user_id: auth.user.userId,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('[POST /api/admin/payment-records] Error creating payment record:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
      });
      return NextResponse.json({ error: 'Failed to create payment record: ' + createError.message }, { status: 500 });
    }

    console.log('[POST /api/admin/payment-records] Successfully created record:', paymentRecord);

    return NextResponse.json(
      { success: true, data: paymentRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/payment-records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
