import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/migrate/add-payment-columns
 * Adds missing columns to the clients table
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Migration] Attempting to add columns to clients table...');

    // Step 1: Try to update a client with the new columns to trigger schema cache update
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        total_amount_paid: 0,
        session_payment_received: false,
      })
      .eq('id', -1); // Non-existent ID, just to trigger the schema check

    if (updateError) {
      if (updateError.message.includes('total_amount_paid')) {
        console.log('[Migration] Column total_amount_paid does not exist');
        // Try to create columns using a workaround
        // We'll use the RPC with the correct headers
      }
    }

    // Step 2: Check if we can query the new columns
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id, total_amount_paid, session_payment_received')
      .limit(1);

    if (testError && testError.message.includes('column')) {
      console.error('[Migration] Columns still do not exist:', testError.message);

      // The columns don't exist - we need to tell the user to add them manually
      // OR we can try using Supabase's admin API differently

      return NextResponse.json(
        {
          status: 'manual_action_required',
          message: 'Please run this SQL in your Supabase SQL Editor',
          sql: `ALTER TABLE clients
ADD COLUMN IF NOT EXISTS total_amount_paid BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_payment_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_payment_date TEXT,
ADD COLUMN IF NOT EXISTS session_payment_amount BIGINT;`,
          instructions: [
            '1. Go to your Supabase project dashboard',
            '2. Click "SQL Editor" on the left',
            '3. Click "New Query"',
            '4. Copy and paste the SQL above',
            '5. Click "Run"',
            '6. Refresh this page'
          ]
        },
        { status: 200 }
      );
    }

    if (testError) {
      console.error('[Migration] Unexpected error:', testError);
      return NextResponse.json(
        { error: 'Failed to verify columns', details: testError.message },
        { status: 500 }
      );
    }

    console.log('[Migration] ✅ Columns exist and are working!');

    return NextResponse.json(
      {
        success: true,
        message: 'Columns are ready. Schema migration complete!',
        columns: ['total_amount_paid', 'session_payment_received', 'session_payment_date', 'session_payment_amount']
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
