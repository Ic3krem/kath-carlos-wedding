import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { POST as login } from '@/app/api/admin/login/route';

describe('POST /api/admin/login', () => {
  beforeEach(async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('correct-horse', 10);
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('rejects a missing password with 400', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await login(request);
    expect(response.status).toBe(400);
  });

  it('rejects an incorrect password with 401', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong' }),
    });
    const response = await login(request);
    expect(response.status).toBe(401);
  });

  it('accepts the correct password and sets a session cookie', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'correct-horse' }),
    });
    const response = await login(request);
    expect(response.status).toBe(200);
    expect(response.cookies.get('admin_session')).toBeDefined();
  });
});
