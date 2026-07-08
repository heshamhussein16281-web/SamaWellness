import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * POST /api/admin/test/seed-test-client - Create a test recurring client
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Seed] Creating test recurring client...');

    const now = new Date().toISOString();

    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          name: 'Test Recurring Client',
          email: 'test.recurring@example.com',
          phone: '01012345678',
          status: 'booking_scheduled',
          is_recurring: true,
          client_since: now,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[Seed] Error creating test client:', error);
      return NextResponse.json(
        { error: 'Failed to create test client', details: error.message },
        { status: 500 }
      );
    }

    console.log('[Seed] Test client created successfully:', {
      id: client.id,
      name: client.name,
      phone: client.phone,
      status: client.status,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Test recurring client created successfully',
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          is_recurring: client.is_recurring,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
