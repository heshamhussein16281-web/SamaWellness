import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    console.log('\n=== CHECKING DATABASE STRUCTURE ===\n');

    // Check therapists table
    console.log('1. Checking "therapists" table...');
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*')
      .limit(10);

    console.log('Therapists error:', therapistsError);
    console.log('Therapists count:', therapists?.length);
    if (therapists && therapists.length > 0) {
      console.log('First therapist:', therapists[0]);
      console.log('Columns:', Object.keys(therapists[0]));
    }

    // Try other possible table names
    const tableNames = ['therapist', 'therapist_list', 'staff', 'clinician', 'clinicians'];
    const otherTables: Record<string, any> = {};

    for (const tableName of tableNames) {
      console.log(`\nChecking "${tableName}" table...`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (!error && data && data.length > 0) {
        console.log(`✅ Found "${tableName}" with ${data.length} records`);
        otherTables[tableName] = {
          count: data.length,
          columns: Object.keys(data[0]),
          sample: data[0]
        };
      }
    }

    return NextResponse.json({
      success: true,
      therapists: {
        count: therapists?.length || 0,
        data: therapists || [],
        error: therapistsError?.message || null,
        columns: therapists && therapists.length > 0 ? Object.keys(therapists[0]) : []
      },
      otherTables,
      message: therapists && therapists.length > 0
        ? `Found ${therapists.length} therapists in the "therapists" table`
        : 'No therapists found in "therapists" table - checked other table names above'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
