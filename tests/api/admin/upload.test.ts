import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import sharp from 'sharp';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({ url: `https://example.public.blob.vercel-storage.com/${pathname}` })),
}));

import { put } from '@vercel/blob';
import { POST as upload } from '@/app/api/admin/upload/route';

async function photo(width: number, height: number) {
  // Noise compresses poorly, like a real photo does.
  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) >>> 24;
  return sharp(raw, { raw: { width, height, channels: 3 } }).jpeg({ quality: 90 }).toBuffer();
}

function request(form: FormData) {
  return new NextRequest('http://localhost/api/admin/upload', { method: 'POST', body: form });
}

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  it('rejects a request with no file', async () => {
    const response = await upload(request(new FormData()));
    expect(response.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it('rejects a file that is not an image', async () => {
    const form = new FormData();
    form.set('file', new File(['not an image'], 'notes.png', { type: 'image/png' }));
    const response = await upload(request(form));
    expect(response.status).toBe(415);
    expect(put).not.toHaveBeenCalled();
  });

  it('resizes, converts to WebP and stores the smaller file', async () => {
    const original = await photo(2400, 1600);
    const form = new FormData();
    form.set('file', new File([original], 'DSCF8740.JPG', { type: 'image/jpeg' }));
    form.set('folder', 'gallery');

    const response = await upload(request(form));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(put).toHaveBeenCalledOnce();
    const [pathname, body, options] = vi.mocked(put).mock.calls[0] as unknown as [string, Buffer, { contentType: string }];
    expect(pathname).toBe('gallery/dscf8740.webp');
    expect(options.contentType).toBe('image/webp');

    const meta = await sharp(body).metadata();
    expect(meta.format).toBe('webp');
    expect(Math.max(meta.width!, meta.height!)).toBe(2000);
    expect(body.length).toBeLessThan(original.length);
    expect(data).toMatchObject({ width: 2000, height: 1333, size: body.length });
    expect(data.url).toContain('gallery/dscf8740.webp');
  });

  it('never enlarges a small image', async () => {
    const form = new FormData();
    form.set('file', new File([await photo(400, 300)], 'small.jpg', { type: 'image/jpeg' }));
    const data = await (await upload(request(form))).json();
    expect(data).toMatchObject({ width: 400, height: 300 });
  });
});
