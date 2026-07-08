import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/cleanup-clients - Delete all clients (TEST ONLY)
 * WARNING: This is a destructive operation. Use only for testing.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cleanup] Starting client deletion...');

    // Delete all clients (cascading deletes should handle related records)
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .neq('id', 0); // neq means "not equal" - this deletes all records

    if (error) {
      console.error('[Cleanup] Error deleting clients:', error);
      return NextResponse.json(
        { error: 'Failed to delete clients', details: error.message },
        { status: 500 }
      );
    }

    console.log('[Cleanup] Successfully deleted all clients');

    return NextResponse.json(
      {
        success: true,
        message: 'All test clients deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
