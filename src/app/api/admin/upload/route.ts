import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { compressImage, DEFAULT_MAX_DIMENSION } from '@/lib/image/compress';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Vercel caps a function's request body at 4.5 MB, so the admin UI shrinks
 * big photos in the browser first (see lib/image/prepare-upload.ts) and this
 * route does the real compression before anything reaches Blob storage.
 */
const MAX_BYTES = 4.5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That file is too large (max 4.5 MB after preparing).' }, { status: 413 });
  }
  if (file.type && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images can be uploaded' }, { status: 415 });
  }

  const requested = Number(form?.get('maxDimension'));
  const maxDimension = Number.isFinite(requested) && requested > 0 ? Math.min(Math.max(requested, 600), 3000) : DEFAULT_MAX_DIMENSION;
  const folder = String(form?.get('folder') || 'uploads').replace(/[^a-z0-9-]/gi, '') || 'uploads';
  const originalName = file instanceof File ? file.name : 'photo';
  const originalSize = Number(form?.get('originalSize')) || file.size;

  let compressed;
  try {
    compressed = await compressImage(Buffer.from(await file.arrayBuffer()), { maxDimension });
  } catch {
    return NextResponse.json({ error: 'That file could not be read as an image. Try a JPEG or PNG.' }, { status: 415 });
  }

  const base = originalName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'photo';
  try {
    const blob = await put(`${folder}/${base}.webp`, compressed.buffer, {
      access: 'public',
      contentType: compressed.contentType,
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return NextResponse.json({
      url: blob.url,
      width: compressed.width,
      height: compressed.height,
      size: compressed.buffer.length,
      originalSize,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `Storage error: ${error.message}` : 'Upload failed' },
      { status: 502 },
    );
  }
}
