import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/check-payment-deadlines
 *
 * Cron job that runs every 15 minutes to check for expired payment deadlines.
 * - Finds bookings with expired payment_deadline
 * - Updates booking_status to 'expired'
 * - Creates notifications for later sending
 * - Logs status changes
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

    // Find bookings with expired payment deadlines
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, client_id, session_date, payment_amount')
      .eq('booking_status', 'scheduled')
      .eq('payment_status', 'pending')
      .lte('payment_deadline', now)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('Error fetching expired bookings:', fetchError);
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json(
        { success: true, count: 0, message: 'No expired payment deadlines found' },
        { status: 200 }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Process each expired booking
    for (const booking of expiredBookings) {
      try {
        // Update booking status to 'expired'
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            booking_status: 'expired',
            updated_at: now
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Failed to update booking ${booking.id}:`, updateError);
          errors.push(`Booking ${booking.id}: ${updateError.message}`);
          failureCount++;
          continue;
        }

        // Create notification for system (if notifications table exists)
        // Note: This is optional and won't fail the cron job if the table doesn't exist
        try {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              client_id: booking.client_id,
              booking_id: booking.id,
              notification_type: 'payment_deadline_expired',
              title: 'Payment Deadline Expired',
              message: `Payment deadline for session on ${new Date(booking.session_date).toLocaleDateString()} has expired.`,
              is_sent: false,
              created_at: now
            }]);

          if (notificationError) {
            console.warn(`Failed to create notification for booking ${booking.id}:`, notificationError.message);
            // Don't fail the entire process if notification creation fails
          }
        } catch (notifErr) {
          console.warn(`Notification creation skipped for booking ${booking.id}:`, notifErr);
          // Continue processing even if notifications table doesn't exist
        }

        // Log status change in client_status_history
        const { error: historyError } = await supabase
          .from('client_status_history')
          .insert([{
            client_id: booking.client_id,
            old_status: 'payment_pending',
            new_status: 'booking_expired',
            reason: 'Payment deadline expired',
            changed_by_user_id: null, // System-generated, no user
            created_at: now
          }]);

        if (historyError) {
          console.warn(`Failed to log status history for client ${booking.client_id}:`, historyError);
          // Don't fail the entire process if history logging fails
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        errors.push(`Booking ${booking.id}: ${error instanceof Error ? error.message : String(error)}`);
        failureCount++;
      }
    }

    const message = `Processed ${expiredBookings.length} bookings: ${successCount} marked expired, ${failureCount} failed`;
    console.log(`[check-payment-deadlines] ${message}`);

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
    console.error('[check-payment-deadlines] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
