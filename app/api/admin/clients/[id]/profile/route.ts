import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';
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
 * GET /api/admin/clients/[id]/profile - Get full client profile
 * Returns: {id, name, email, phone, date_of_birth, status, is_recurring, client_since,
 *           total_sessions_completed, total_amount_paid, therapist_id, therapist_name,
 *           intake_date, referral_source, notes,
 *           payment_verified_1, payment_amount_1, payment_date_1,
 *           payment_verified_2, payment_amount_2, payment_date_2,
 *           total_payment_due,
 *           session_payment_received, session_payment_date, session_payment_amount}
 * PHASE 2: All new consolidated payment field names included
 * Status: 200, 401/403/404/500 on error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  unstable_noStore();

  const auth = await checkPermission(request, 'view_clients');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;

    // Parse ID as number (clients.id is BIGSERIAL)
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
    }

    // Fetch client with therapist name and payment amounts
    // PHASE 2: Include all new consolidated payment field names
    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        date_of_birth,
        status,
        is_recurring,
        client_since,
        intake_date,
        referral_source,
        notes,
        therapist_id,
        payment_verified_1,
        payment_amount_1,
        payment_date_1,
        payment_verified_2,
        payment_amount_2,
        payment_date_2,
        total_amount_paid,
        total_payment_due,
        session_payment_received,
        session_payment_date,
        session_payment_amount,
        therapists:therapist_id (id, name, email)
      `)
      .eq('id', clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Count total completed sessions
    const { count: totalSessions, error: sessionsError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('booking_status', 'completed');

    if (sessionsError) {
      console.error('Error counting sessions:', sessionsError);
    }

    // Use the total_amount_paid field directly from the clients table
    // This is the actual verified/paid amount, not the expected payment amounts
    let totalAmountPaid = client.total_amount_paid || 0;

    // Format response
    const therapist = Array.isArray(client.therapists) ? client.therapists[0] : client.therapists;

    return NextResponse.json(
      {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        date_of_birth: client.date_of_birth,
        status: client.status,
        is_recurring: client.is_recurring,
        client_since: client.client_since,
        intake_date: client.intake_date,
        referral_source: client.referral_source,
        notes: client.notes,
        therapist_id: client.therapist_id,
        therapist_name: therapist?.name || null,
        total_sessions_completed: totalSessions || 0,
        total_amount_paid: totalAmountPaid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/clients/[id]/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
