import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const GUESTS = [
  { id: 'a', name: 'Maria Santos', max_guests: 3, companions_allowed: 2, sort_order: 0 },
  { id: 'b', name: 'John Reyes', max_guests: 1, sort_order: 1 },
];

let existing: Record<string, unknown> | null = null;
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
    const response = await POST(post({ name: '', response: 'maybe' }));
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects a name that is not on the guest list', async () => {
    const response = await POST(post({ name: 'Someone Else', response: 'yes', companions: [] }));
    expect(response.status).toBe(404);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects more companions than the invitation allows', async () => {
    const response = await POST(post({ name: 'john reyes', response: 'yes', companions: ['Plus One'] }));
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('matches the name loosely and stores the invitation spelling', async () => {
    const response = await POST(post({ name: '  maría   SANTOS ', response: 'yes', companions: ['Ana Cruz', 'Ben Cruz'] }));
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledWith({
      name: 'Maria Santos',
      attending: true,
      guest_count: 3,
      guest_names: 'Ana Cruz, Ben Cruz',
    });
    expect(await response.json()).toMatchObject({ name: 'Maria Santos', response: 'yes', total: 3 });
  });

  it('drops companions when declining', async () => {
    await POST(post({ name: 'Maria Santos', response: 'no', companions: ['Ana Cruz'] }));
    expect(insertMock).toHaveBeenCalledWith({ name: 'Maria Santos', attending: false, guest_count: 0, guest_names: null });
  });

  it('refuses a second RSVP and returns the one on file', async () => {
    existing = { id: 'r1', name: 'Maria Santos', attending: true, guest_count: 2, guest_names: 'Ana Cruz', proxy_name: null } as never;
    const response = await POST(post({ name: 'Maria Santos', response: 'no' }));
    expect(response.status).toBe(409);
    expect(insertMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect((await response.json()).rsvp).toMatchObject({ response: 'yes', companions: ['Ana Cruz'], total: 2 });
  });

  it('records a proxy attending in the invitee place', async () => {
    const response = await POST(post({ name: 'Maria Santos', response: 'proxy', proxyName: 'Lola Santos', companions: [] }));
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledWith({ name: 'Maria Santos', attending: true, guest_count: 1, guest_names: null, proxy_name: 'Lola Santos' });
    expect(await response.json()).toMatchObject({ response: 'proxy', proxyName: 'Lola Santos', total: 1 });
  });

  it('requires the proxy name', async () => {
    const response = await POST(post({ name: 'Maria Santos', response: 'proxy', companions: [] }));
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });
});
