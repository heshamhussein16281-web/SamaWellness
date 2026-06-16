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
      // Step 1: Get user's role_id
      const { data: userData, error: userError } = await supabase
        .from('clinic_users')
        .select('role_id')
        .eq('id', payload.userId)
        .single();

      if (userError) {
        console.log('Auth verify - Step 1 (user query) failed:', userError);
      } else if (userData?.role_id) {
        // Step 2: Get permission_ids for this role
        const { data: rolePerms, error: rolePermsError } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', userData.role_id);

        if (rolePermsError) {
          console.log('Auth verify - Step 2 (role_permissions query) failed:', rolePermsError);
        } else if (rolePerms && rolePerms.length > 0) {
          const permissionIds = rolePerms.map((rp: any) => rp.permission_id);
          console.log('Auth verify - Found permission IDs:', permissionIds);

          // Step 3: Get permission keys
          const { data: perms, error: permsError } = await supabase
            .from('permissions')
            .select('key')
            .in('id', permissionIds);

          if (permsError) {
            console.log('Auth verify - Step 3 (permissions query) failed:', permsError);
          } else if (perms && perms.length > 0) {
            const dbPermissions = perms.map((p: any) => p.key).filter(Boolean);
            console.log('Auth verify - Successfully fetched permissions from DB:', { count: dbPermissions.length, permissions: dbPermissions });
            permissions = dbPermissions;
          } else {
            console.log('Auth verify - Step 3 returned no permissions');
          }
        } else {
          console.log('Auth verify - Step 2 returned no role permissions');
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
