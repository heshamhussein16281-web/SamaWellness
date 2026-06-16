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
    const { data: user, error: userError } = await supabase
      .from('clinic_users')
      .select('id, role_id')
      .eq('id', payload.userId)
      .single();

    let permissions = payload.permissions;

    if (!userError && user?.role_id) {
      // Query permissions through role
      const { data: rolePerms, error: permError } = await supabase
        .from('role_permissions')
        .select('permissions(key)')
        .eq('role_id', user.role_id);

      if (!permError && rolePerms) {
        const dbPermissions = rolePerms.map((rp: any) => rp.permissions?.key).filter(Boolean);
        console.log('Auth verify - Extracted permissions from DB:', { permCount: dbPermissions.length, permissions: dbPermissions });
        permissions = dbPermissions;
      } else {
        console.log('Auth verify - Permission query failed, using JWT permissions:', { permError });
      }
    } else {
      console.log('Auth verify - User query failed, using JWT permissions:', { userError });
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
