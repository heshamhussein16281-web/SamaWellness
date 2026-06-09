import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { getServiceClient } from '@/lib/supabase-service';

async function authenticate(request: NextRequest) {
  const token = getJWTFromCookie(request.headers.get('cookie') || undefined);
  return token ? await verifyJWT(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    if (!await authenticate(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await authenticate(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = getServiceClient();
    const body = await request.json();
    const { data, error } = await supabase.from('assessments').insert([body]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
