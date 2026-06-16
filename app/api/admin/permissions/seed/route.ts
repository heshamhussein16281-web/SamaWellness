import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkAdminPermission(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found' };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  if (!payload.permissions.includes('manage_roles')) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true, user: payload };
}

// POST: Seed therapist permissions
export async function POST(request: NextRequest) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    // Define new therapist permissions
    const therapistPermissions = [
      {
        key: 'view_therapists',
        name: 'View Therapists',
        description: 'View therapist list and details',
        category: 'Therapists',
      },
      {
        key: 'manage_therapists',
        name: 'Manage Therapists',
        description: 'Create, edit, and delete therapists',
        category: 'Therapists',
      },
      {
        key: 'create_therapist',
        name: 'Create Therapist',
        description: 'Create new therapist records',
        category: 'Therapists',
      },
    ];

    const createdPermissions = [];

    // Insert each permission if it doesn't exist
    for (const permission of therapistPermissions) {
      const { data: existing } = await supabase
        .from('permissions')
        .select('id')
        .eq('key', permission.key)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('permissions')
          .insert([permission])
          .select()
          .single();

        if (error) {
          console.error(`Error creating permission ${permission.key}:`, error);
        } else {
          createdPermissions.push(data);
        }
      } else {
        createdPermissions.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Therapist permissions seeded successfully',
      permissions: createdPermissions,
    });
  } catch (error) {
    console.error('Error seeding permissions:', error);
    return NextResponse.json(
      { error: 'Failed to seed permissions' },
      { status: 500 }
    );
  }
}
