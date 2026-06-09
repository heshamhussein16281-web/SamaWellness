import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
async function authenticate(request: NextRequest) {
  const token = getJWTFromCookie(request.headers.get('cookie') || undefined);
  return token ? await verifyJWT(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    if (!await authenticate(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabase.from('change_log').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
