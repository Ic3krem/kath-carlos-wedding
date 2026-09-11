import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth/session';

describe('session utility', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('creates a token that verifies as valid', async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it('rejects a garbage token', async () => {
    expect(await verifySessionToken('not-a-real-token')).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken();
    process.env.SESSION_SECRET = 'a-completely-different-secret-value';
    expect(await verifySessionToken(token)).toBe(false);
  });
});
