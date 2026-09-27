import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const GUESTS = [
  { id: 'a', name: 'Maria Santos', max_guests: 3, sort_order: 0 },
  { id: 'b', name: 'John Reyes', max_guests: 1, sort_order: 1 },
];

let existing: { id: string } | null = null;
const insertMock = vi.fn(async () => ({ error: null }));
const updateEqMock = vi.fn(async () => ({ error: null }));
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const lookupChain = {
  ilike: vi.fn(() => lookupChain),
  order: vi.fn(() => lookupChain),
  limit: vi.fn(() => lookupChain),
  maybeSingle: vi.fn(async () => ({ data: existing, error: null })),
};
const fromMock = vi.fn((table: string) => {
  if (table === 'invite_allocations') {
    return { select: () => ({ order: async () => ({ data: GUESTS, error: null }) }) };
  }
  return { select: () => lookupChain, insert: insertMock, update: updateMock };
});

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/rsvp/route';

function post(body: unknown) {
  return new NextRequest('http://localhost/api/rsvp', { method: 'POST', body: JSON.stringify(body) });
}

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    existing = null;
  });

  it('rejects an invalid payload with 400 and does not touch the database', async () => {
    const response = await POST(post({ name: '', attending: 'maybe' }));
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects a name that is not on the guest list', async () => {
    const response = await POST(post({ name: 'Someone Else', attending: true, companions: [] }));
    expect(response.status).toBe(404);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects more companions than the invitation allows', async () => {
    const response = await POST(post({ name: 'john reyes', attending: true, companions: ['Plus One'] }));
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('matches the name loosely and stores the invitation spelling', async () => {
    const response = await POST(post({ name: '  maría   SANTOS ', attending: true, companions: ['Ana Cruz', 'Ben Cruz'] }));
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledWith({
      name: 'Maria Santos',
      attending: true,
      guest_count: 3,
      guest_names: 'Ana Cruz, Ben Cruz',
    });
    expect(await response.json()).toMatchObject({ name: 'Maria Santos', attending: true, total: 3 });
  });

  it('drops companions when declining', async () => {
    await POST(post({ name: 'Maria Santos', attending: false, companions: ['Ana Cruz'] }));
    expect(insertMock).toHaveBeenCalledWith({ name: 'Maria Santos', attending: false, guest_count: 0, guest_names: null });
  });

  it('updates the earlier RSVP instead of adding a second one', async () => {
    existing = { id: 'r1' };
    const response = await POST(post({ name: 'Maria Santos', attending: true, companions: [] }));
    expect(response.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
    expect(updateEqMock).toHaveBeenCalledWith('id', 'r1');
  });
});
