import { jwtVerify, SignJWT } from 'jose';

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sama_wellness_jwt_secret_2024_secure_key_32chars'
);

export interface JWTPayload {
  username: string;
  role: 'reception' | 'admin';
  iat?: number;
  exp?: number;
  [key: string]: string | number | undefined;
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
 * Verify credentials against environment variables
 */
export function verifyCredentials(username: string, password: string): JWTPayload | null {
  const receptionPassword = process.env.RECEPTION_PASSWORD || '1234';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Sama202#';

  if (username === 'reception' && password === receptionPassword) {
    return { username: 'reception', role: 'reception' };
  }

  if (username === 'admin' && password === adminPassword) {
    return { username: 'admin', role: 'admin' };
  }

  return null;
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

  return `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/**
 * Create a logout cookie (expires immediately)
 */
export function createLogoutCookie(): string {
  return `auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
