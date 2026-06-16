import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n=== VERIFYING THERAPISTS DATA ===\n');

    // Check if therapists table exists and has data
    const { data: therapists, error, count } = await supabase
      .from('therapists')
      .select('*', { count: 'exact' });

    console.log('Query error:', error?.message);
    console.log('Therapists count:', count);
    console.log('Data length:', therapists?.length);
    console.log('Therapists data:', therapists);

    // Also check table structure
    const { data: tableInfo } = await supabase
      .from('therapists')
      .select('*')
      .limit(1);

    const columns = tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : [];

    return NextResponse.json({
      success: true,
      therapists: {
        count,
        data: therapists,
        error: error?.message || null,
        columns: columns,
        isEmpty: therapists?.length === 0
      },
      message: therapists && therapists.length > 0
        ? `Found ${therapists.length} therapists`
        : 'Therapists table is empty - no records found'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
