import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock, single: singleMock }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const eqMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const deleteEqMock = vi.fn(async () => ({ error: null }));
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock, update: updateMock, delete: deleteMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/entourage/route';
import { PUT, DELETE } from '@/app/api/admin/entourage/[id]/route';

describe('/api/admin/entourage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [{ id: '1', category: 'parents', role_label: 'Father of the Groom', name: 'Juan', side: 'groom', sort_order: 0 }], error: null });
    singleMock.mockResolvedValue({ data: { id: '2', category: 'godparents', role_label: 'Ninong', name: 'Pedro', side: null, sort_order: 1 }, error: null });
  });

  it('GET lists members ordered by sort_order', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('POST creates a member', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage', {
      method: 'POST',
      body: JSON.stringify({ category: 'godparents', role_label: 'Ninong', name: 'Pedro', side: null, sort_order: 1 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('PUT updates a member by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage/2', {
      method: 'PUT',
      body: JSON.stringify({ category: 'godparents', role_label: 'Ninong', name: 'Pedro Jr.', side: null, sort_order: 1 }),
    });
    const response = await PUT(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
    expect(eqMock).toHaveBeenCalledWith('id', '2');
  });

  it('DELETE removes a member by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage/2', { method: 'DELETE' });
    const response = await DELETE(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledOnce();
    expect(deleteEqMock).toHaveBeenCalledWith('id', '2');
  });
});
