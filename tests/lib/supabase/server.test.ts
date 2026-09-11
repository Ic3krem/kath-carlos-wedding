import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('getSupabaseServerClient', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('throws when env vars are missing', async () => {
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    expect(() => getSupabaseServerClient()).toThrow(/SUPABASE_URL/);
  });

  it('returns a client when env vars are present', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    const client = getSupabaseServerClient();
    expect(client.from).toBeInstanceOf(Function);
  });
});
