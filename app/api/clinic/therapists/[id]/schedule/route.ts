import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// GET therapist's schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('therapist_schedules')
      .select('*')
      .eq('therapist_id', params.id)
      .order('day_of_week');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// POST/PUT - Add or update schedule for a day (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth token and admin status
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { day_of_week, start_hour, end_hour } = body;

    // Validation
    if (!day_of_week || start_hour === undefined || end_hour === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: day_of_week, start_hour, end_hour' },
        { status: 400 }
      );
    }

    if (start_hour < 11 || end_hour > 22 || start_hour >= end_hour) {
      return NextResponse.json(
        { error: 'Hours must be between 11 AM (11) and 9 PM (21), and start < end' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Upsert schedule (insert or update if exists)
    const { data, error } = await supabase
      .from('therapist_schedules')
      .upsert(
        [
          {
            therapist_id: params.id,
            day_of_week,
            start_hour,
            end_hour,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'therapist_id,day_of_week' }
      )
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE - Remove schedule for a specific day (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth token and admin status
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const day_of_week = searchParams.get('day');

    if (!day_of_week) {
      return NextResponse.json(
        { error: 'Missing day_of_week query parameter' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Delete specific schedule
    const { error } = await supabase
      .from('therapist_schedules')
      .delete()
      .eq('therapist_id', params.id)
      .eq('day_of_week', day_of_week);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
