import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/create-fresh-recurring
 * Creates a fresh recurring client with:
 * - Therapist pre-assigned
 * - Status "completed" (ready to book next session)
 * - 2 completed bookings in history
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[CreateFreshRecurring] Creating complete recurring client test scenario...');

    const now = new Date().toISOString();
    const timestamp = Date.now();

    // Create a unique phone number to avoid conflicts
    const uniquePhone = `010${timestamp.toString().slice(-9)}`;

    // First, get any available therapist
    const { data: therapists, error: therapistError } = await supabase
      .from('therapists')
      .select('id')
      .limit(1);

    if (therapistError || !therapists || therapists.length === 0) {
      return NextResponse.json(
        { error: 'No therapists found. Please create a therapist first.' },
        { status: 400 }
      );
    }

    const therapistId = therapists[0].id;
    console.log('[CreateFreshRecurring] Using therapist ID:', therapistId);

    // Create the recurring client with therapist already assigned
    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name: `Test Recurring - ${timestamp}`,
          email: `test.recurring.${timestamp}@example.com`,
          phone: uniquePhone,
          status: 'completed', // Can book next session
          therapist_id: therapistId, // Pre-assigned ✓
          is_recurring: true,
          client_since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now,
          total_sessions_completed: 2, // ✓ 2 completed sessions
          // Payment fields
          payment_verified_1: true,
          payment_amount_1: 2000,
          payment_date_1: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          payment_verified_2: false,
          payment_amount_2: null,
          payment_date_2: null,
          total_payment_due: 2000,
          total_amount_paid: 2000, // Already paid for first session
          session_payment_received: false,
          session_payment_date: null,
          session_payment_amount: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[CreateFreshRecurring] Error creating test client:', error);
      return NextResponse.json(
        { error: 'Failed to create test client', details: error.message },
        { status: 500 }
      );
    }

    // Create 2 completed bookings in the past
    const pastDate1 = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    const pastDate2 = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago

    await supabase.from('bookings').insert([
      {
        client_id: client.id,
        therapist_id: therapistId,
        session_date: pastDate1.toISOString(),
        duration_minutes: 60,
        session_type: 'single',
        booking_status: 'completed',
        payment_status: 'paid',
        notes: 'Previous session 1',
        created_at: pastDate1.toISOString(),
        updated_at: pastDate1.toISOString(),
      },
      {
        client_id: client.id,
        therapist_id: therapistId,
        session_date: pastDate2.toISOString(),
        duration_minutes: 60,
        session_type: 'single',
        booking_status: 'completed',
        payment_status: 'paid',
        notes: 'Previous session 2',
        created_at: pastDate2.toISOString(),
        updated_at: pastDate2.toISOString(),
      },
    ]);

    console.log('[CreateFreshRecurring] Test client created successfully:', {
      id: client.id,
      name: client.name,
      phone: client.phone,
      status: client.status,
      therapistId,
      sessionsCompleted: 2,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complete recurring client test scenario created',
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          is_recurring: client.is_recurring,
          therapist_id: therapistId,
          total_sessions_completed: 2,
          totalPaymentDue: client.total_payment_due,
          totalAmountPaid: client.total_amount_paid,
          instructions: 'Recurring client with therapist assigned and 2 completed sessions. Ready to: 1) Book Session → 2) Verify Payment → 3) Complete Session',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CreateFreshRecurring] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
