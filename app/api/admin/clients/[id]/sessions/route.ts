import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkPermission(
  request: NextRequest,
  requiredPermission: string
): Promise<
  | { authorized: false; error: string; status: number }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found', status: 401 };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token', status: 401 };
  }

  if (!payload.permissions.includes(requiredPermission)) {
    return { authorized: false, error: 'Insufficient permissions', status: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * GET /api/admin/clients/[id]/sessions - Get completed sessions for a client
 * Query: page (default 1), limit (default 20)
 * Returns: array of {session_date, duration_minutes, therapist_name, session_outcome, progress_score, notes}
 * Status: 200, 401/403/404/500 on error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'view_bookings');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    // Parse client ID
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID format' }, { status: 400 });
    }

    // Get total count of completed sessions
    const { count: totalCount, error: countError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('booking_status', 'completed');

    if (countError) {
      console.error('Error counting sessions:', countError);
      return NextResponse.json({ error: 'Failed to fetch sessions count' }, { status: 500 });
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch completed sessions with therapist names
    const { data: sessions, error } = await supabase
      .from('bookings')
      .select(`
        session_date,
        duration_minutes,
        booking_status,
        notes,
        therapists:therapist_id (id, name),
        session_notes
      `)
      .eq('client_id', clientId)
      .eq('booking_status', 'completed')
      .order('session_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Format response with therapist names and session notes
    const formattedSessions = (sessions || []).map((session: any) => {
      const therapist = Array.isArray(session.therapists) ? session.therapists[0] : session.therapists;
      const sessionNotes = session.session_notes ?
        (Array.isArray(session.session_notes) ? session.session_notes[0] : session.session_notes)
        : null;

      return {
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        therapist_name: therapist?.name || null,
        session_outcome: sessionNotes?.session_outcome || null,
        progress_score: sessionNotes?.progress_score || null,
        notes: session.notes,
      };
    });

    return NextResponse.json(
      {
        data: formattedSessions,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/clients/[id]/sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
