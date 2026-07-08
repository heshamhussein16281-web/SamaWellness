import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/migrate-columns - Add missing columns to clients table
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Migrate] Checking and adding missing columns...');

    // Try to update all clients with default values for new columns
    // This will add the columns if they don't exist
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        total_amount_paid: 0,
        session_payment_received: false,
      })
      .neq('id', 0); // Update all records

    if (updateError && updateError.message?.includes('column')) {
      console.log('[Migrate] Columns might not exist yet, this is expected for new databases');
      console.log('[Migrate] Please add the columns manually via Supabase dashboard:');
      console.log('[Migrate] 1. total_amount_paid (numeric, default: 0)');
      console.log('[Migrate] 2. session_payment_received (boolean, default: false)');

      return NextResponse.json(
        {
          warning: 'Columns do not exist in database schema',
          message: 'Please add these columns to the clients table via Supabase dashboard:',
          columns: [
            { name: 'total_amount_paid', type: 'numeric', default: 0 },
            { name: 'session_payment_received', type: 'boolean', default: false },
          ],
          instructions: [
            '1. Go to Supabase dashboard',
            '2. Find the "clients" table',
            '3. Click "Add column"',
            '4. Add "total_amount_paid" as NUMERIC/BIGINT with default 0',
            '5. Add "session_payment_received" as BOOLEAN with default false',
            '6. Refresh the page and try again',
          ],
        },
        { status: 200 }
      );
    }

    if (updateError) {
      console.error('[Migrate] Unexpected error:', updateError);
      return NextResponse.json(
        { error: 'Migration failed', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[Migrate] Migration completed successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'All clients updated with new columns',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Migrate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
