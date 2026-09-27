import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const orderMock = vi.fn();
const maybeSingleMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock, eq: () => ({ maybeSingle: maybeSingleMock }) }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const updateEqMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const deleteEqMock = vi.fn(async () => ({ error: null }));
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock, update: updateMock, delete: deleteMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

vi.mock('@vercel/blob', () => ({ del: vi.fn(async () => undefined) }));

import { del } from '@vercel/blob';
import { GET, POST } from '@/app/api/admin/gallery/route';
import { DELETE, PUT } from '@/app/api/admin/gallery/[id]/route';

describe('/api/admin/gallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [{ id: '1', image_url: 'https://x/1.png', caption: null, sort_order: 0 }], error: null });
    singleMock.mockResolvedValue({ data: { id: '2', image_url: 'https://x/2.png', caption: 'Engagement', sort_order: 1 }, error: null });
  });

  it('GET lists images ordered by sort_order', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('POST creates a gallery image', async () => {
    const request = new NextRequest('http://localhost/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify({ image_url: 'https://x/2.png', caption: 'Engagement', sort_order: 1 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('PUT updates only the caption and order', async () => {
    const request = new NextRequest('http://localhost/api/admin/gallery/2', {
      method: 'PUT',
      body: JSON.stringify({ caption: '  Beach  ', sort_order: 4, image_url: 'https://evil/x.png' }),
    });
    const response = await PUT(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({ caption: 'Beach', sort_order: 4 });
    expect(updateEqMock).toHaveBeenCalledWith('id', '2');
  });

  it('DELETE also removes the stored Blob file', async () => {
    maybeSingleMock.mockResolvedValue({ data: { image_url: 'https://abc.public.blob.vercel-storage.com/gallery/a.webp' } });
    const request = new NextRequest('http://localhost/api/admin/gallery/2', { method: 'DELETE' });
    const response = await DELETE(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(del).toHaveBeenCalledWith('https://abc.public.blob.vercel-storage.com/gallery/a.webp');
  });

  it('DELETE leaves non-Blob images (bundled samples) alone', async () => {
    maybeSingleMock.mockResolvedValue({ data: { image_url: '/gallery/gallery1.webp' } });
    const request = new NextRequest('http://localhost/api/admin/gallery/2', { method: 'DELETE' });
    await DELETE(request, { params: { id: '2' } });
    expect(del).not.toHaveBeenCalled();
  });

  it('DELETE removes an image by id', async () => {
    maybeSingleMock.mockResolvedValue({ data: null });
    const request = new NextRequest('http://localhost/api/admin/gallery/2', { method: 'DELETE' });
    const response = await DELETE(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledOnce();
    expect(deleteEqMock).toHaveBeenCalledWith('id', '2');
  });
});
