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
 * POST /api/admin/bookings/[id]/complete-session - Mark a session as completed
 * Body: {notes (optional), session_outcome (optional), progress_score (optional 1-5)}
 * Response: {success, data: updated_booking}
 * Status: 200, 400/401/403/404/500 on error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'create_booking');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { notes, session_outcome, progress_score, session_status } = body;

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id, therapist_id, booking_status, payment_status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine if no-show or completed
    const isNoShow = session_status === 'no_show';

    // Update booking status to completed (both completed and no-show count as completed)
    const { data: completedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'completed',
        status: isNoShow ? 'no_show' : 'completed', // Store session outcome in status field for tracking
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json({ error: 'Failed to complete booking' }, { status: 500 });
    }

    // If notes provided, create session notes record
    if (notes && typeof notes === 'string' && notes.trim().length > 0) {
      const { error: notesError } = await supabase
        .from('session_notes')
        .insert([
          {
            booking_id: bookingId,
            therapist_id: booking.therapist_id,
            notes: notes.trim(),
            session_outcome: session_outcome?.trim() || null,
            progress_score: progress_score || null,
          },
        ]);

      if (notesError) {
        console.error('Error creating session note:', notesError);
        // Don't fail the request if notes fail, just log it
      }
    }

    // Update client: increment total_sessions_completed, update last_session_date
    // All clients should return to ready_for_booking so they can book next session
    console.log('[complete-session] Fetching client data for client_id:', booking.client_id);

    const { data: client, error: clientFetchError } = await supabase
      .from('clients')
      .select('is_recurring, therapist_id')
      .eq('id', booking.client_id)
      .single();

    if (clientFetchError) {
      console.error('[complete-session] Error fetching client:', clientFetchError);
      return NextResponse.json({ error: `Failed to fetch client: ${clientFetchError.message}` }, { status: 500 });
    }

    const clientUpdate: any = {
      total_sessions_completed: completedBooking.id ? (await getSessionCount(booking.client_id)) : 0,
      last_session_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // All clients return to ready_for_booking so they can book next session
    if (client?.is_recurring) {
      // Recurring clients go back to recurring_client status
      clientUpdate.status = 'recurring_client';
    } else {
      // One-time clients go back to ready_for_booking to allow reboking
      clientUpdate.status = 'ready_for_booking';
    }

    console.log('[complete-session] Updating client', booking.client_id, 'with:', clientUpdate);

    const { error: clientError } = await supabase
      .from('clients')
      .update(clientUpdate)
      .eq('id', booking.client_id);

    if (clientError) {
      console.error('[complete-session] Error updating client:', {
        error: clientError,
        client_id: booking.client_id,
        update_data: clientUpdate
      });
      return NextResponse.json({ error: `Failed to update client status: ${clientError.message}` }, { status: 500 });
    }

    console.log('[complete-session] Client updated successfully for client_id:', booking.client_id);

    // Record session payment in payment_history for accounting
    try {
      // For recurring clients, record the payment from current cycle
      if (client?.is_recurring && completedBooking.payment_amount) {
        console.log('[complete-session] Recording session payment in history for booking:', bookingId);
        await supabase.from('payment_history').insert([
          {
            client_id: booking.client_id,
            booking_id: bookingId,
            amount: completedBooking.payment_amount,
            payment_date: new Date().toISOString(),
            payment_type: 'session',
            verified: true,
            verified_by: auth.user.userId,
            verified_at: new Date().toISOString(),
            notes: `Session ${isNoShow ? 'no-show' : 'completed'} - payment recorded for accounting`
          }
        ]);
      }
    } catch (historyError) {
      console.error('[complete-session] Error recording payment in history:', historyError);
      // Don't fail the request if payment history recording fails
    }

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'update',
      entityType: 'booking',
      entityId: bookingId.toString(),
      entityName: `Booking ${bookingId} marked as completed`,
    });

    return NextResponse.json(
      {
        success: true,
        data: completedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/bookings/[id]/complete-session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSessionCount(clientId: number): Promise<number> {
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('client_id', clientId)
    .eq('booking_status', 'completed');

  return count || 0;
}
