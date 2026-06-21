import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n=== VERIFYING THERAPIST SCHEDULES ===\n');

    // Check therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*');

    console.log('Therapists:', therapists?.length || 0);
    console.log('Therapists Error:', therapistsError?.message);

    // Check schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('therapist_schedules')
      .select('*');

    console.log('Schedules:', schedules?.length || 0);
    console.log('Schedules Error:', schedulesError?.message);
    console.log('Schedules Data:', schedules);

    // Check individual therapist with schedules
    if (therapists && therapists.length > 0) {
      const therapistId = therapists[0].id;
      console.log('\nChecking therapist:', therapists[0].name, '(ID:', therapistId, ')');
      
      const { data: therapistSchedules } = await supabase
        .from('therapist_schedules')
        .select('*')
        .eq('therapist_id', therapistId);
      
      console.log('Schedules for this therapist:', therapistSchedules);
    }

    return NextResponse.json({
      success: true,
      therapistsCount: therapists?.length || 0,
      schedulesCount: schedules?.length || 0,
      therapists: therapists?.slice(0, 3), // First 3 for brevity
      schedules: schedules?.slice(0, 10), // First 10 for brevity
      hasScheduleTable: !schedulesError,
      schedulesError: schedulesError?.message || null
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
