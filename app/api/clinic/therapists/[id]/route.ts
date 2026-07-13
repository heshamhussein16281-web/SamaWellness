import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// GET single therapist with schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  unstable_noStore();

  try {
    const supabase = getServiceClient();

    // Fetch therapist
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', params.id)
      .single();

    if (therapistError) throw therapistError;

    // Fetch therapist's schedule
    const { data: schedules, error: schedulesError } = await supabase
      .from('therapist_schedules')
      .select('*')
      .eq('therapist_id', params.id)
      .order('day_of_week');

    if (schedulesError) throw schedulesError;

    return NextResponse.json({
      ...therapist,
      schedules: schedules || [],
    });
  } catch (error) {
    console.error('Error fetching therapist:', error);
    return NextResponse.json(
      { error: 'Therapist not found' },
      { status: 404 }
    );
  }
}

// PUT - Update therapist (Admin only)
export async function PUT(
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
    const { name, initials, rate, is_senior, status } = body;

    // Validation
    if (rate && rate < 2000) {
      return NextResponse.json(
        { error: 'Minimum therapist rate is 2,000 EGP' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Update therapist
    const { data, error } = await supabase
      .from('therapists')
      .update({
        ...(name && { name }),
        ...(initials && { initials }),
        ...(rate && { rate }),
        ...(is_senior !== undefined && { is_senior }),
        ...(status && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error updating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to update therapist' },
      { status: 500 }
    );
  }
}

// DELETE - Delete therapist (Admin only)
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

    const supabase = getServiceClient();

    // Delete therapist (cascades to schedules)
    const { error } = await supabase
      .from('therapists')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    return NextResponse.json(
      { error: 'Failed to delete therapist' },
      { status: 500 }
    );
  }
}
