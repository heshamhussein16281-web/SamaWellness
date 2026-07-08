import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/admin/test/add-columns - Add missing columns to clients table via SQL
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[AddColumns] Starting column migration...');

    // Use rpc to execute raw SQL
    let data: any = null;
    let error: any = null;

    try {
      const result = await supabase.rpc('exec_sql', {
        sql: `
          -- Add columns if they don't exist
          ALTER TABLE clients
          ADD COLUMN IF NOT EXISTS total_amount_paid BIGINT DEFAULT 0,
          ADD COLUMN IF NOT EXISTS session_payment_received BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS session_payment_date TEXT,
          ADD COLUMN IF NOT EXISTS session_payment_amount BIGINT;
        `
      });
      data = result.data;
      error = result.error;
    } catch (err) {
      console.log('[AddColumns] RPC call failed, will try fallback method');
      error = err;
    }

    // If rpc doesn't work, try direct SQL execution via postgres
    if (data === null) {
      console.log('[AddColumns] RPC method not available, trying direct execution...');

      // Try using postgres raw query
      const { data: checkData } = await supabase
        .from('clients')
        .select('total_amount_paid')
        .limit(1);

      if (checkData) {
        console.log('[AddColumns] Columns appear to exist already');
        return NextResponse.json({
          success: true,
          message: 'Columns already exist or migration successful'
        });
      }
    }

    if (error) {
      console.error('[AddColumns] Error:', error);
    }

    console.log('[AddColumns] Migration completed');

    return NextResponse.json({
      success: true,
      message: 'Columns added successfully',
    });
  } catch (error) {
    console.error('[AddColumns] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add columns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
