import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get therapists from the public schema
    console.log('Querying therapists from public schema...');
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*');

    console.log('Therapists error:', therapistsError?.message);
    console.log('Therapists found:', therapists?.length);

    // Try to list all tables by querying different common table names
    const commonTables = [
      'therapists',
      'therapist',
      'staff',
      'clinician',
      'clinicians',
      'users',
      'clients',
      'bookings',
      'roles',
      'permissions',
      'clinic_users',
      'appointments',
      'sessions',
      'invoices',
      'payments'
    ];

    const allData: Record<string, any> = {};

    for (const tableName of commonTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });

        if (!error && data) {
          allData[tableName] = {
            exists: true,
            recordCount: count || data.length,
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            sample: data[0] || null,
            allRecords: data
          };
        }
      } catch (e) {
        // Table doesn't exist
      }
    }

    return NextResponse.json({
      success: true,
      database: {
        url: supabaseUrl,
        schema: 'public (default)'
      },
      tables: allData,
      therapistsTableInfo: {
        data: therapists,
        error: therapistsError?.message || null,
        recordCount: therapists?.length || 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
