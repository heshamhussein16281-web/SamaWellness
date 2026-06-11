import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction, calculateChanges } from '@/lib/audit';

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

// PUT: Update role name and description
export async function PUT(
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Fetch current role before update
    const { data: currentRole, error: fetchError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data: role, error } = await supabase
      .from('roles')
      .update({ name, description: description || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Role name already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    // Calculate changes for audit log
    const changedFields: Record<string, any> = {};
    if (name !== undefined) changedFields.name = name;
    if (description !== undefined) changedFields.description = description;

    const changes = calculateChanges(currentRole, changedFields);

    await logAuditAction({
      adminId: auth.user!.id,
      action: 'update',
      entityType: 'role',
      entityId: id,
      entityName: currentRole.name,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Role updated successfully',
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE: Delete/archive role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id } = params;

    // Fetch role name before deletion
    const { data: roleInfo, error: fetchError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // First, delete all role_permissions associations
    const { error: deletePermissionsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    if (deletePermissionsError) throw deletePermissionsError;

    // Then delete the role
    const { data: role, error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      adminId: auth.user!.id,
      action: 'delete',
      entityType: 'role',
      entityId: id,
      entityName: roleInfo.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Role deleted successfully',
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
