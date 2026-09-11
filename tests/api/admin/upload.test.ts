import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({ url: `https://example.public.blob.vercel-storage.com/${pathname}` })),
}));

import { put } from '@vercel/blob';
import { POST as upload } from '@/app/api/admin/upload/route';

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  it('rejects a request with no file', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/admin/upload', { method: 'POST', body: formData });
    const response = await upload(request);
    expect(response.status).toBe(400);
  });

  it('uploads the file via @vercel/blob and returns the url', async () => {
    const file = new File(['fake-bytes'], 'photo.png', { type: 'image/png' });
    const formData = new FormData();
    formData.set('file', file);
    const request = new NextRequest('http://localhost/api/admin/upload', { method: 'POST', body: formData });
    const response = await upload(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.url).toContain('photo.png');
    expect(put).toHaveBeenCalledOnce();
  });
});
