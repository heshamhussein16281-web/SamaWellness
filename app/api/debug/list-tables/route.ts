import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the information schema to get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      // Fallback: Try common table names
      const commonTables = ['therapists', 'therapist', 'staff', 'clinician', 'clinicians', 'users', 'roles', 'permissions', 'clinic_users', 'clients', 'bookings'];

      const results: Record<string, any> = {};
      for (const table of commonTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(5);

          if (!error) {
            results[table] = {
              exists: true,
              recordCount: data?.length || 0,
              columns: data && data.length > 0 ? Object.keys(data[0]) : [],
              sample: data?.[0] || null
            };
          }
        } catch (e) {
          // Table doesn't exist
        }
      }

      return NextResponse.json({
        success: true,
        method: 'common_tables_check',
        tables: results
      });
    }

    // Get details for each table
    const results: Record<string, any> = {};
    const tableList = tables?.map((t: any) => t.table_name) || [];

    for (const tableName of tableList) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);

        if (!error) {
          results[tableName] = {
            exists: true,
            recordCount: data?.length || 0,
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            sample: data?.[0] || null
          };
        }
      } catch (e) {
        results[tableName] = { exists: false, error: String(e) };
      }
    }

    return NextResponse.json({
      success: true,
      method: 'information_schema_query',
      allTables: tableList,
      tableDetails: results
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
