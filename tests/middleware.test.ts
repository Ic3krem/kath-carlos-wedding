import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { middleware } from '@/middleware';

describe('admin middleware', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('allows /admin/login through without a session', async () => {
    const request = new NextRequest('http://localhost/admin/login');
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });

  it('redirects unauthenticated page requests to /admin/login', async () => {
    const request = new NextRequest('http://localhost/admin');
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/login');
  });

  it('returns 401 for unauthenticated API requests', async () => {
    const request = new NextRequest('http://localhost/api/admin/settings');
    const response = await middleware(request);
    expect(response.status).toBe(401);
  });

  it('allows requests through with a valid session cookie', async () => {
    const token = await createSessionToken();
    const request = new NextRequest('http://localhost/admin', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});
