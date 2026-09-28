import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONTENT_TAG, CONTENT_TTL } from '@/lib/cache';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
      global: {
        // Next.js patches the global fetch to cache requests by default; without
        // this override, admin edits silently fail to appear until a server
        // restart because Supabase reads get served from Next's Data Cache.
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    });
  }
  return cachedClient;
}

let publicClient: SupabaseClient | null = null;

/**
 * Client for public page reads. Instead of opting out of caching, each
 * request joins Next's Data Cache under the content tag, so pages can be
 * statically served and are refreshed by invalidateSite() on admin saves.
 */
export function getSupabasePublicClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  if (!publicClient) {
    publicClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: CONTENT_TTL, tags: [CONTENT_TAG] } } as RequestInit),
      },
    });
  }
  return publicClient;
}
