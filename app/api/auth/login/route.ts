import { NextRequest, NextResponse } from 'next/server';
import { signJWT, verifyCredentials, createAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const payload = verifyCredentials(username, password);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signJWT(payload);

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          username: payload.username,
          role: payload.role,
        },
      },
      { status: 200 }
    );

    // Set HttpOnly cookie
    response.headers.append('Set-Cookie', createAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
