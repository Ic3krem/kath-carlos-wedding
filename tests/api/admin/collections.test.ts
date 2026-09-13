import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock, eq: () => ({ single: singleMock }) }));
const insertMock = vi.fn((_row: Record<string, unknown>) => ({ select: () => ({ single: singleMock }) }));
const upsertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const eqMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const deleteEqMock = vi.fn(async () => ({ error: null }));
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock = vi.fn(() => ({
  select: selectMock,
  insert: insertMock,
  upsert: upsertMock,
  update: updateMock,
  delete: deleteMock,
}));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/collections/[table]/route';
import { PUT, DELETE } from '@/app/api/admin/collections/[table]/[id]/route';
import { PUT as PUT_SINGLETON } from '@/app/api/admin/singletons/[table]/route';

function post(table: string, body: unknown) {
  return new NextRequest(`http://localhost/api/admin/collections/${table}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('/api/admin/collections/[table]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [{ id: '1', title: 'A Question by the Water' }], error: null });
    singleMock.mockResolvedValue({ data: { id: '1', title: 'A Question by the Water' }, error: null });
  });

  it('GET lists rows of a known collection', async () => {
    const request = new NextRequest('http://localhost/api/admin/collections/story_milestones');
    const response = await GET(request, { params: { table: 'story_milestones' } });
    expect(response.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith('story_milestones');
  });

  it('rejects a table that is not in the spec', async () => {
    const request = new NextRequest('http://localhost/api/admin/collections/settings');
    const response = await GET(request, { params: { table: 'settings' } });
    expect(response.status).toBe(404);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('POST writes only the columns the spec declares', async () => {
    const response = await POST(post('theme_colors', { name: 'Sage', hex: '#7C8C6B', sort_order: 2, id: 'spoofed', role: 'admin' }), {
      params: { table: 'theme_colors' },
    });
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledWith({ name: 'Sage', hex: '#7C8C6B', sort_order: 2 });
  });

  it('POST coerces checkbox and number columns', async () => {
    await POST(post('schedule_events', { title: 'Ceremony', is_highlight: 'true', sort_order: '3' }), {
      params: { table: 'schedule_events' },
    });
    const written = insertMock.mock.calls[0][0];
    expect(written.is_highlight).toBe(true);
    expect(written.sort_order).toBe(3);
  });

  it('PUT updates a row by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/collections/contacts/9', {
      method: 'PUT',
      body: JSON.stringify({ role: 'Bride', name: 'Kath', phone: '', email: '', sort_order: 0 }),
    });
    const response = await PUT(request, { params: { table: 'contacts', id: '9' } });
    expect(response.status).toBe(200);
    expect(eqMock).toHaveBeenCalledWith('id', '9');
  });

  it('DELETE removes a row by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/collections/contacts/9', { method: 'DELETE' });
    const response = await DELETE(request, { params: { table: 'contacts', id: '9' } });
    expect(response.status).toBe(200);
    expect(deleteEqMock).toHaveBeenCalledWith('id', '9');
  });
});

describe('/api/admin/singletons/[table]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { id: 1, intro: 'Your presence is the gift.' }, error: null });
  });

  it('PUT upserts row 1 with the spec columns', async () => {
    const request = new NextRequest('http://localhost/api/admin/singletons/gift_guide', {
      method: 'PUT',
      body: JSON.stringify({ intro: 'Your presence is the gift.', id: 7 }),
    });
    const response = await PUT_SINGLETON(request, { params: { table: 'gift_guide' } });
    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({ id: 1, intro: 'Your presence is the gift.' });
  });

  it('rejects an unknown section', async () => {
    const request = new NextRequest('http://localhost/api/admin/singletons/rsvps', {
      method: 'PUT',
      body: JSON.stringify({}),
    });
    const response = await PUT_SINGLETON(request, { params: { table: 'rsvps' } });
    expect(response.status).toBe(404);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
