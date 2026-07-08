import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/create-fresh-recurring
 * Creates a fresh recurring client in 'recurring_client' status, ready to book a session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[CreateFreshRecurring] Creating fresh recurring client ready for booking...');

    const now = new Date().toISOString();
    const timestamp = Date.now();

    // Create a unique phone number to avoid conflicts
    const uniquePhone = `010${timestamp.toString().slice(-9)}`;

    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name: `Test Recurring - ${timestamp}`,
          email: `test.recurring.${timestamp}@example.com`,
          phone: uniquePhone,
          status: 'recurring_client', // Ready to book first session
          is_recurring: true,
          client_since: now,
          created_at: now,
          updated_at: now,
          // Payment fields already initialized with defaults
          payment_verified_1: false,
          payment_amount_1: null,
          payment_date_1: null,
          payment_verified_2: false,
          payment_amount_2: null,
          payment_date_2: null,
          total_payment_due: 2000,
          total_amount_paid: 0,
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

    console.log('[CreateFreshRecurring] Test client created successfully:', {
      id: client.id,
      name: client.name,
      phone: client.phone,
      status: client.status,
      is_recurring: client.is_recurring,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Fresh recurring client created successfully - ready to book session',
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          is_recurring: client.is_recurring,
          totalPaymentDue: client.total_payment_due,
          totalAmountPaid: client.total_amount_paid,
          instructions: 'This client is ready to: 1) Book Session → 2) Verify Payment → 3) Complete Session',
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
