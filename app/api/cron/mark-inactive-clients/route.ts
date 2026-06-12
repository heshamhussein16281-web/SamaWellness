import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/mark-inactive-clients
 *
 * Cron job that runs daily at 2am UTC to mark inactive clients.
 * - Finds clients with status='active' AND last_session_date < 90 days ago
 * - Updates client status to 'inactive'
 * - Logs status change in client_status_history
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
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();
    const BATCH_SIZE = 1000;
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Find inactive clients (active status and last session > 90 days ago)
    const { data: inactiveClients, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('status', 'active')
      .lt('last_session_date', ninetyDaysAgo)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('Error fetching inactive clients:', fetchError);
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    if (!inactiveClients || inactiveClients.length === 0) {
      return NextResponse.json(
        { success: true, count: 0, message: 'No inactive clients found' },
        { status: 200 }
      );
    }

    // Process each inactive client
    for (const client of inactiveClients) {
      try {
        // Update client status to 'inactive'
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            status: 'inactive',
            updated_at: nowIso
          })
          .eq('id', client.id);

        if (updateError) {
          console.error(`Failed to update client ${client.id}:`, updateError);
          errors.push(`Client ${client.id}: ${updateError.message}`);
          failureCount++;
          continue;
        }

        // Log status change in client_status_history
        const { error: historyError } = await supabase
          .from('client_status_history')
          .insert([{
            client_id: client.id,
            old_status: 'active',
            new_status: 'inactive',
            reason: 'No activity for 90 days',
            changed_by_user_id: null, // System-generated, no user
            created_at: nowIso
          }]);

        if (historyError) {
          console.warn(`Failed to log status history for client ${client.id}:`, historyError);
          // Don't fail the entire process if history logging fails
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing client ${client.id}:`, error);
        errors.push(`Client ${client.id}: ${error instanceof Error ? error.message : String(error)}`);
        failureCount++;
      }
    }

    const message = `Processed ${inactiveClients.length} clients: ${successCount} marked inactive, ${failureCount} failed`;
    console.log(`[mark-inactive-clients] ${message}`);

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
    console.error('[mark-inactive-clients] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
