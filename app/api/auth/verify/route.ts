import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const token = getJWTFromCookie(cookieHeader || undefined);

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch fresh permissions from database (real-time) - use join for reliability
    let permissions = payload.permissions;

    try {
      // Get permissions through a join query
      const { data: permData, error: permError } = await supabase
        .from('clinic_users')
        .select(`
          id,
          roles!inner (
            id,
            role_permissions!inner (
              permissions!inner (key)
            )
          )
        `)
        .eq('id', payload.userId)
        .single();

      if (!permError && permData?.roles) {
        const roleData = Array.isArray(permData.roles) ? permData.roles[0] : permData.roles;
        if (roleData?.role_permissions) {
          const dbPermissions = roleData.role_permissions
            .map((rp: any) => {
              // Handle both nested object and array formats
              const perm = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
              return perm?.key;
            })
            .filter(Boolean);

          if (dbPermissions.length > 0) {
            console.log('Auth verify - Extracted permissions from DB:', { permCount: dbPermissions.length, permissions: dbPermissions });
            permissions = dbPermissions;
          } else {
            console.log('Auth verify - No permissions found in nested query');
          }
        }
      } else {
        console.log('Auth verify - Nested query failed:', permError);
      }
    } catch (dbError) {
      console.log('Auth verify - Database query error, using JWT permissions:', dbError);
    }

    return NextResponse.json(
      {
        authenticated: true,
        username: payload.username,
        role: payload.roleName,
        permissions: permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
