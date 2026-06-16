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

    // Fetch fresh permissions from database (real-time)
    let permissions = payload.permissions;

    try {
      // Step 1: Get user's role
      const { data: user, error: userError } = await supabase
        .from('clinic_users')
        .select('role_id')
        .eq('id', payload.userId)
        .single();

      if (userError) {
        console.log('Auth verify - User query failed:', userError);
      } else if (user?.role_id) {
        // Step 2: Get all permissions for this role
        const { data: rolePerms, error: rpError } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', user.role_id);

        if (!rpError && rolePerms && rolePerms.length > 0) {
          // Step 3: Get permission keys for these IDs
          const permissionIds = rolePerms.map((rp: any) => rp.permission_id);
          const { data: perms, error: permError } = await supabase
            .from('permissions')
            .select('key')
            .in('id', permissionIds);

          if (!permError && perms) {
            const dbPermissions = perms.map((p: any) => p.key).filter(Boolean);
            console.log('Auth verify - Extracted permissions from DB:', { permCount: dbPermissions.length, permissions: dbPermissions });
            permissions = dbPermissions;
          } else {
            console.log('Auth verify - Permission fetch failed:', permError);
          }
        } else {
          console.log('Auth verify - Role permissions not found:', rpError);
        }
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
