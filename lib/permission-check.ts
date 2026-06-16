import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Check if a user has a specific permission by querying the database in real-time
 * This ensures permission changes take effect immediately without requiring logout/login
 */
export async function checkUserPermission(
  userId: string,
  requiredPermission: string
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('clinic_users')
      .select(`
        roles (
          role_permissions (
            permissions (key)
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user permissions:', error);
      return false;
    }

    const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
    const permissions = role?.role_permissions?.map((rp: any) => rp.permissions.key) || [];

    return permissions.includes(requiredPermission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user has ANY of the required permissions
 */
export async function checkUserPermissions(
  userId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('clinic_users')
      .select(`
        roles (
          role_permissions (
            permissions (key)
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user permissions:', error);
      return false;
    }

    const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
    const permissions = role?.role_permissions?.map((rp: any) => rp.permissions.key) || [];

    return requiredPermissions.some(p => permissions.includes(p));
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}
