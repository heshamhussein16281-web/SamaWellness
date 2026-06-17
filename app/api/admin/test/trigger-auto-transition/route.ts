import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/test/trigger-auto-transition
 *
 * Manual trigger endpoint for testing auto-transitions
 * Requires admin authentication
 *
 * This endpoint calls the auto-transition job and returns results
 * Use this for testing without waiting for cron jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieHeader = request.headers.get('cookie');
    const token = getJWTFromCookie(cookieHeader || undefined);

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify admin permission
    if (!payload.permissions.includes('manage_bookings') && !payload.permissions.includes('view_all_clients')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Call the auto-transition endpoint
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${proto}://${host}`;

    const response = await fetch(`${baseUrl}/api/admin/bookings/auto-transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: 'Manual auto-transition triggered',
        result: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Manual trigger error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger auto-transition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
