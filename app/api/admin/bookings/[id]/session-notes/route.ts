import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { logAuditAction } from '@/lib/audit';

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
 * GET /api/admin/bookings/[id]/session-notes - Retrieve all session notes for a booking
 * Query: sorted by created_at DESC
 * Response: {success, data: [{id, therapist_id, therapist_name, therapist_email, notes, session_outcome, progress_score, created_at}...]}
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

    // Parse ID as number (bookings.id is BIGSERIAL)
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Fetch session notes with therapist info, ordered by created_at DESC
    const { data: notes, error: notesError } = await supabase
      .from('session_notes')
      .select(`
        id,
        therapist_id,
        notes,
        session_outcome,
        progress_score,
        created_at,
        therapists:therapist_id (id, name, email)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Error fetching session notes:', notesError);
      return NextResponse.json({ error: 'Failed to fetch session notes' }, { status: 500 });
    }

    // Format response with therapist name/email at top level
    const formattedNotes = notes.map((note: any) => ({
      id: note.id,
      therapist_id: note.therapist_id,
      therapist_name: note.therapists?.name || '',
      therapist_email: note.therapists?.email || '',
      notes: note.notes,
      session_outcome: note.session_outcome,
      progress_score: note.progress_score,
      created_at: note.created_at,
    }));

    return NextResponse.json({ success: true, data: formattedNotes }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/bookings/[id]/session-notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/bookings/[id]/session-notes - Add session notes to a booking
 * Body: {notes (TEXT, required), session_outcome (TEXT, optional), progress_score (INT 1-5, optional)}
 * Logic:
 *   1. Verify booking exists
 *   2. Verify user is therapist assigned to booking OR has admin permission
 *   3. Create session_notes record with therapist_id from JWT
 *   4. Return created note with ID
 * Response: {success, data: {id, booking_id, therapist_id, notes, session_outcome, progress_score, created_at}}
 * Status: 201 on success, 400/401/403/404/500 on error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkPermission(request, 'create_booking');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { notes, session_outcome, progress_score } = body;

    // Validate required fields
    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'notes is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate notes length (max 5000 chars)
    if (notes.length > 5000) {
      return NextResponse.json(
        { error: 'notes must not exceed 5000 characters' },
        { status: 400 }
      );
    }

    // Validate optional session_outcome (max 1000 chars)
    if (session_outcome !== undefined && session_outcome !== null) {
      if (typeof session_outcome !== 'string' || session_outcome.length > 1000) {
        return NextResponse.json(
          { error: 'session_outcome must be a string not exceeding 1000 characters' },
          { status: 400 }
        );
      }
    }

    // Validate optional progress_score (must be 1-5 if provided)
    if (progress_score !== undefined && progress_score !== null) {
      if (!Number.isInteger(progress_score) || progress_score < 1 || progress_score > 5) {
        return NextResponse.json(
          { error: 'progress_score must be an integer between 1 and 5' },
          { status: 400 }
        );
      }
    }

    // Parse booking ID
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID format' }, { status: 400 });
    }

    // Fetch booking with therapist info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, therapist_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is therapist assigned to booking or has admin permission
    const isAdmin = auth.user.permissions.includes('manage_users') || auth.user.is_super_admin;
    const isAssignedTherapist = booking.therapist_id === parseInt(auth.user.userId, 10);

    if (!isAdmin && !isAssignedTherapist) {
      return NextResponse.json(
        { error: 'You are not authorized to add notes to this booking' },
        { status: 403 }
      );
    }

    // Create session notes record with therapist_id from JWT
    // Note: JWT userId is UUID for clinic_users, but we need therapist_id (BIGINT)
    // For therapists, we use booking.therapist_id as the source of truth
    const { data: sessionNote, error: insertError } = await supabase
      .from('session_notes')
      .insert([
        {
          booking_id: bookingId,
          therapist_id: booking.therapist_id,
          notes: notes.trim(),
          session_outcome: session_outcome?.trim() || null,
          progress_score: progress_score || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating session note:', insertError);
      return NextResponse.json({ error: 'Failed to create session note' }, { status: 500 });
    }

    // Log audit action
    await logAuditAction({
      adminId: auth.user.userId,
      action: 'create',
      entityType: 'session_note',
      entityId: sessionNote.id,
      entityName: `Session note for booking ${bookingId}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: sessionNote.id,
          booking_id: sessionNote.booking_id,
          therapist_id: sessionNote.therapist_id,
          notes: sessionNote.notes,
          session_outcome: sessionNote.session_outcome,
          progress_score: sessionNote.progress_score,
          created_at: sessionNote.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/bookings/[id]/session-notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
