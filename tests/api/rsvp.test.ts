import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const insertMock = vi.fn(async () => ({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/rsvp/route';

describe('POST /api/rsvp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an invalid payload with 400 and does not touch the database', async () => {
    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'bad', attending: true, guest_count: 0 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('inserts a valid RSVP and returns 201', async () => {
    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: 'Juan', email: 'juan@example.com', attending: true, guest_count: 2 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });
});
