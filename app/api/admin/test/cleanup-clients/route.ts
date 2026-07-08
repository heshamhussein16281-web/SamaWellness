import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/cleanup-clients - Delete test clients only
 * WARNING: This is a destructive operation. Use only for testing.
 * Only deletes clients with names starting with "Test".
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Cleanup] Starting test client deletion...');

    // Delete only test clients (those with names starting with "Test")
    const { count, error } = await supabase
      .from('clients')
      .delete()
      .ilike('name', 'Test%'); // ilike is case-insensitive pattern matching

    if (error) {
      console.error('[Cleanup] Error deleting test clients:', error);
      return NextResponse.json(
        { error: 'Failed to delete test clients', details: error.message },
        { status: 500 }
      );
    }

    console.log('[Cleanup] Successfully deleted test clients:', count);

    return NextResponse.json(
      {
        success: true,
        message: `Test clients deleted successfully`,
        deletedCount: count || 0,
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
