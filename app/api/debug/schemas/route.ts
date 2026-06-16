import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all schemas
    const { data: schemas, error: schemasError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name');

    if (schemasError) {
      console.error('Error fetching schemas:', schemasError);
      return NextResponse.json({
        success: false,
        error: schemasError.message
      });
    }

    const schemaNames = schemas?.map((s: any) => s.schema_name) || [];

    // For each schema, get all tables
    const schemaDetails: Record<string, any> = {};

    for (const schemaName of schemaNames) {
      try {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', schemaName);

        if (!tablesError) {
          const tableNames = tables?.map((t: any) => t.table_name) || [];

          // Get record counts and columns for each table
          const tableDetails: Record<string, any> = {};

          for (const tableName of tableNames) {
            try {
              const { data, error } = await supabase
                .from(`${schemaName}.${tableName}`)
                .select('*')
                .limit(1);

              if (!error) {
                tableDetails[tableName] = {
                  exists: true,
                  columns: data && data.length > 0 ? Object.keys(data[0]) : []
                };
              }
            } catch (e) {
              tableDetails[tableName] = { exists: false, error: String(e) };
            }
          }

          schemaDetails[schemaName] = {
            tables: tableNames,
            tableDetails
          };
        }
      } catch (e) {
        schemaDetails[schemaName] = { error: String(e) };
      }
    }

    return NextResponse.json({
      success: true,
      allSchemas: schemaNames,
      schemaDetails
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
