import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction } from '@/lib/audit';

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

// POST: Assign permissions to role
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { permission_ids } = body;

    if (!Array.isArray(permission_ids)) {
      return NextResponse.json(
        { error: 'permission_ids must be an array' },
        { status: 400 }
      );
    }

    // Fetch role name before updating permissions
    const { data: roleInfo, error: fetchRoleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchRoleError) throw fetchRoleError;

    // First, delete existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    if (deleteError) throw deleteError;

    // Then insert new permissions
    const rolePermissions = permission_ids.map((permission_id: string) => ({
      role_id: id,
      permission_id,
    }));

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (insertError) throw insertError;

    // Fetch updated role with permissions
    const { data: role, error: fetchError } = await supabase
      .from('roles')
      .select(`
        id,
        name,
        description,
        role_permissions (
          permissions (id, key, name, description, category)
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    await logAuditAction({
      adminId: auth.user!.id,
      action: 'update',
      entityType: 'permission',
      entityId: id,
      entityName: `${roleInfo.name} permissions`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Permissions assigned successfully',
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning permissions:', error);
    return NextResponse.json(
      { error: 'Failed to assign permissions' },
      { status: 500 }
    );
  }
}

// GET: Get available permissions
export async function GET(request: NextRequest) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ permissions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
