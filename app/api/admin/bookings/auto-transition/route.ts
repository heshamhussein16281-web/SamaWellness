import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, key);
};

/**
 * POST /api/admin/bookings/auto-transition
 *
 * Background job endpoint to auto-transition booking statuses based on time
 *
 * Actions:
 * 1. Transition booking_scheduled → active (when current time >= session_start_time)
 * 2. Transition active → completed (when current time >= session_end_time AND not cancelled)
 *
 * This endpoint should be called by a cron job every 1-5 minutes
 *
 * Security: Requires SUPABASE_SERVICE_ROLE_KEY (backend-only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    let transitionedCount = 0;

    // ========================================
    // 1. AUTO-TRANSITION: scheduled → active
    // ========================================
    console.log(`[Auto-Transition] Checking for sessions to start at ${now}`);

    const { data: scheduledBookings, error: scheduledError } = await supabase
      .from('bookings')
      .select('id, client_id, booking_status, session_start_time')
      .eq('booking_status', 'scheduled')
      .lte('session_start_time', now)
      .is('cancelled_at', null); // Only non-cancelled bookings

    if (scheduledError) {
      console.error('Error fetching scheduled bookings:', scheduledError);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled bookings' },
        { status: 500 }
      );
    }

    if (scheduledBookings && scheduledBookings.length > 0) {
      const scheduledIds = scheduledBookings.map((b) => b.id);

      const { error: updateScheduledError } = await supabase
        .from('bookings')
        .update({
          booking_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .in('id', scheduledIds);

      if (updateScheduledError) {
        console.error('Error updating scheduled bookings to active:', updateScheduledError);
      } else {
        transitionedCount += scheduledIds.length;
        console.log(`[Auto-Transition] Transitioned ${scheduledIds.length} bookings to active`);

        // Log audit for each transition
        for (const booking of scheduledBookings) {
          await supabase.from('client_status_history').insert({
            client_id: booking.client_id,
            old_status: 'booking_scheduled',
            new_status: 'active',
            changed_by_user_id: null, // System-generated
            reason: 'Auto-transitioned when session started',
            created_at: now,
          });
        }
      }
    }

    // ========================================
    // 2. AUTO-TRANSITION: active → completed
    // ========================================
    console.log(`[Auto-Transition] Checking for sessions to end at ${now}`);

    const { data: activeBookings, error: activeError } = await supabase
      .from('bookings')
      .select('id, client_id, booking_status, session_end_time')
      .eq('booking_status', 'active')
      .lte('session_end_time', now)
      .is('cancelled_at', null); // Only non-cancelled bookings

    if (activeError) {
      console.error('Error fetching active bookings:', activeError);
      return NextResponse.json(
        { error: 'Failed to fetch active bookings' },
        { status: 500 }
      );
    }

    if (activeBookings && activeBookings.length > 0) {
      const activeIds = activeBookings.map((b) => b.id);

      const { error: updateActiveError } = await supabase
        .from('bookings')
        .update({
          booking_status: 'completed',
          auto_completed: true,
          auto_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', activeIds);

      if (updateActiveError) {
        console.error('Error updating active bookings to completed:', updateActiveError);
      } else {
        transitionedCount += activeIds.length;
        console.log(`[Auto-Transition] Transitioned ${activeIds.length} bookings to completed`);

        // Update clients table: last_session_date, total_sessions_completed, is_recurring
        const { data: completedBookings } = await supabase
          .from('bookings')
          .select('client_id')
          .in('id', activeIds);

        if (completedBookings) {
          const uniqueClientIds = new Set(completedBookings.map((b) => b.client_id));
          const clientIds = Array.from(uniqueClientIds);

          for (const clientId of clientIds) {
            // Get current values
            const { data: client } = await supabase
              .from('clients')
              .select('total_sessions_completed, is_recurring')
              .eq('id', clientId)
              .single();

            if (client) {
              await supabase
                .from('clients')
                .update({
                  last_session_date: now,
                  total_sessions_completed: (client.total_sessions_completed || 0) + 1,
                  is_recurring: true, // After first session, they become recurring
                  status: 'completed',
                  updated_at: now,
                })
                .eq('id', clientId);

              // Log client status change
              await supabase.from('client_status_history').insert({
                client_id: clientId,
                old_status: 'active',
                new_status: 'completed',
                changed_by_user_id: null, // System-generated
                reason: 'Auto-transitioned when session ended',
                created_at: now,
              });
            }
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Auto-transition completed. Transitioned ${transitionedCount} bookings.`,
        transitionedCount,
        timestamp: now,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auto-transition error:', error);
    return NextResponse.json(
      { error: 'Internal server error during auto-transition' },
      { status: 500 }
    );
  }
}
