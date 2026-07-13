import { jwtVerify, SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sama_wellness_jwt_secret_2024_secure_key_32chars'
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  roleName: string;
  permissions: string[];
  is_super_admin?: boolean;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Sign a JWT token with user credentials
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(jwtSecret);

  return token;
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, jwtSecret);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify credentials against database
 */
export async function verifyCredentials(username: string, password: string): Promise<JWTPayload | null> {
  try {
    console.log('verifyCredentials called for user:', username);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Using SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: user, error } = await supabase
      .from('clinic_users')
      .select(`
        id,
        username,
        password_hash,
        is_active,
        roles:role_id (
          id,
          name,
          is_super_admin,
          role_permissions (
            permissions (key, name)
          )
        )
      `)
      .eq('username', username)
      .single();

    if (error) {
      console.log('Query error:', error);
      return null;
    }

    if (!user) {
      console.log('User not found:', username);
      return null;
    }

    if (!user.is_active) {
      console.log('User is inactive:', username);
      return null;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('Invalid password for user:', username);
      return null;
    }

    // Extract permissions from role_permissions
    const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
    const dbPermissions = role?.role_permissions?.map((rp: any) => rp.permissions.key) || [];

    // Provide default permissions based on role if no database permissions exist
    const roleName = role?.name || 'user';
    const adminPermissions = [
      'create_client', 'view_clients', 'view_bookings', 'view_payments',
      'view_assessments', 'view_satisfaction', 'view_expenses', 'view_reports',
      'view_payouts', 'manage_users', 'manage_roles', 'view_change_log',
      'view_therapists', 'manage_therapists', 'create_therapist', 'manage_clients'
    ];
    const defaultPermissions: Record<string, string[]> = {
      'admin': adminPermissions,
      'super admin': adminPermissions,  // Handle role name from database
      'reception': [
        'create_client', 'view_clients', 'view_bookings', 'view_payments',
        'view_assessments', 'view_satisfaction', 'view_therapists', 'manage_clients'
      ],
      'clinician': [
        'view_clients', 'view_bookings', 'view_assessments', 'view_satisfaction',
        'view_therapists', 'manage_therapists'
      ]
    };

    // Merge database permissions with defaults for the role
    // Database permissions are explicit; defaults fill in missing permissions
    const roleDefaults = defaultPermissions[roleName.toLowerCase()] || [];
    const permissions = Array.from(new Set([...dbPermissions, ...roleDefaults]));

    console.log(`[AUTH] Role: ${roleName}, DB Permissions: ${dbPermissions.length}, Default Permissions: ${roleDefaults.length}, Merged: ${permissions.length}`);
    console.log(`[AUTH] DB Perms:`, dbPermissions);
    console.log(`[AUTH] Default Perms:`, roleDefaults);
    console.log(`[AUTH] Final Perms:`, permissions);

    return {
      userId: user.id,
      username: user.username,
      role: role?.id || 'user',
      roleName: role?.name || 'user',
      permissions,
      is_super_admin: role?.is_super_admin || false,
    };
  } catch (error) {
    console.error('Credential verification error:', error);
    return null;
  }
}

/**
 * Extract JWT from request cookies
 */
export function getJWTFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies['auth_token'] || null;
}

/**
 * Create a Set-Cookie header value for JWT
 */
export function createAuthCookie(token: string): string {
  // 8 hours in seconds
  const maxAge = 8 * 60 * 60;
  const isProduction = process.env.NODE_ENV === 'production';

  // Only use Secure flag in production (HTTPS)
  const secure = isProduction ? '; Secure' : '';

  return `auth_token=${token}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${maxAge}`;
}

/**
 * Create a logout cookie (expires immediately)
 */
export function createLogoutCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';

  return `auth_token=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
