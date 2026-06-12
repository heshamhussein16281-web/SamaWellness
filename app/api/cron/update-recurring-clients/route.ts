import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/update-recurring-clients
 *
 * Cron job that runs daily at 1am UTC to update recurring client status.
 * - Finds all clients with completed bookings
 * - Marks clients with >= 1 completed session as recurring
 * - Updates total_sessions_completed and total_amount_paid
 *
 * Authentication: X-Cron-Secret header (matches CRON_SECRET env var)
 * Response: {success, count, message}
 */

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = request.headers.get('X-Cron-Secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }

  if (!cronSecret) {
    console.error('X-Cron-Secret header missing');
    return false;
  }

  return cronSecret === expectedSecret;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing cron secret' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const now = new Date().toISOString();
    const BATCH_SIZE = 1000;
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Get all completed bookings to find unique clients
    const { data: completedBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('client_id')
      .eq('booking_status', 'completed')
      .limit(BATCH_SIZE);

    if (bookingError) {
      console.error('Error fetching completed bookings:', bookingError);
      throw new Error(`Database fetch error: ${bookingError.message}`);
    }

    if (!completedBookings || completedBookings.length === 0) {
      return NextResponse.json(
        { success: true, count: 0, message: 'No clients with completed bookings found' },
        { status: 200 }
      );
    }

    // Get unique client IDs
    const uniqueClientIds = Array.from(new Set(completedBookings.map(b => b.client_id)));

    // Process each client
    for (const clientId of uniqueClientIds) {
      try {
        // Count completed sessions for this client
        const { data: sessionData, error: countError, count: totalSessionsCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .eq('booking_status', 'completed');

        if (countError) {
          console.error(`Error counting sessions for client ${clientId}:`, countError);
          errors.push(`Client ${clientId}: ${countError.message}`);
          failureCount++;
          continue;
        }

        const totalSessions = totalSessionsCount || 0;
        const isRecurring = totalSessions >= 1;

        // Get total amount paid from payment records
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_records')
          .select('amount_paid')
          .eq('client_id', clientId);

        if (paymentError) {
          console.error(`Error fetching payments for client ${clientId}:`, paymentError);
          errors.push(`Client ${clientId} payments: ${paymentError.message}`);
          failureCount++;
          continue;
        }

        const totalAmountPaid = paymentData?.reduce((sum, p) => sum + parseFloat(p.amount_paid || '0'), 0) || 0;

        // Update client record
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            is_recurring: isRecurring,
            total_sessions_completed: totalSessions,
            total_amount_paid: totalAmountPaid,
            updated_at: now
          })
          .eq('id', clientId);

        if (updateError) {
          console.error(`Error updating client ${clientId}:`, updateError);
          errors.push(`Client ${clientId} update: ${updateError.message}`);
          failureCount++;
          continue;
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing client ${clientId}:`, error);
        errors.push(`Client ${clientId}: ${error instanceof Error ? error.message : String(error)}`);
        failureCount++;
      }
    }

    const message = `Updated ${uniqueClientIds.length} clients: ${successCount} successful, ${failureCount} failed`;
    console.log(`[update-recurring-clients] ${message}`);

    return NextResponse.json(
      {
        success: failureCount === 0,
        count: successCount,
        failed: failureCount,
        message,
        errors: errors.length > 0 ? errors : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[update-recurring-clients] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
