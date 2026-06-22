import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase service client with service role key.
 * This is created at runtime (not module import) to avoid build-time failures
 * when environment variables are not available.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars required'
    );
  }

  return createClient(url, key);
}
