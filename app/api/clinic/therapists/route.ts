import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET all therapists
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();

    // Fetch all therapists
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*')
      .order('name');

    if (therapistsError) throw therapistsError;

    return NextResponse.json({ therapists: therapists || [] });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}

// POST - Create new therapist (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check auth token and admin status
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, initials, rate, is_senior } = body;

    // Validation
    if (!name || !initials || !rate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rate < 2000) {
      return NextResponse.json(
        { error: 'Minimum therapist rate is 2,000 EGP' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Insert therapist
    const { data, error } = await supabase
      .from('therapists')
      .insert([
        {
          name,
          initials,
          rate,
          is_senior: is_senior || false,
          status: 'active',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating therapist:', error);
    return NextResponse.json(
      { error: 'Failed to create therapist' },
      { status: 500 }
    );
  }
}
