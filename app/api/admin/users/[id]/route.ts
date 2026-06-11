import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
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

  if (!payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true, user: payload };
}

// PUT: Update user
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
    const { email, password, role_id, is_active } = body;

    // Fetch current user before update
    const { data: currentUser, error: fetchError } = await supabase
      .from('clinic_users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (email !== undefined) updateData.email = email;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const { data: user, error } = await supabase
      .from('clinic_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Calculate changes for audit log
    const changedFields: Record<string, any> = {};
    if (email !== undefined) changedFields.email = email;
    if (role_id !== undefined) changedFields.role_id = role_id;
    if (is_active !== undefined) changedFields.is_active = is_active;

    const changes = calculateChanges(currentUser, changedFields);

    await logAuditAction({
      adminId: auth.user!.id,
      action: 'update',
      entityType: 'user',
      entityId: id,
      entityName: currentUser.username || currentUser.email,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_active: user.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Block/deactivate user
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

    // Fetch user info before deactivation
    const { data: userInfo, error: fetchError } = await supabase
      .from('clinic_users')
      .select('username, email')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Deactivate user instead of deleting
    const { data: user, error } = await supabase
      .from('clinic_users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      adminId: auth.user!.id,
      action: 'delete',
      entityType: 'user',
      entityId: id,
      entityName: `${userInfo.username || userInfo.email} (deactivated)`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User blocked successfully',
        user: {
          id: user.id,
          username: user.username,
          is_active: user.is_active,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}
