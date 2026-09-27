'use client';

/** Stay safely under Vercel's 4.5 MB request-body limit. */
const TARGET_BYTES = 3.5 * 1024 * 1024;
/** Enough headroom for the server's own resize (2000–2400 px). */
const MAX_EDGE = 3000;

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * Shrinks a large photo in the browser so it fits through the upload route.
 * Small files pass through untouched; the server does the final WebP
 * compression either way.
 */
export async function prepareForUpload(file: File): Promise<Blob> {
  if (file.size <= TARGET_BYTES && file.type !== 'image/heic') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`${file.name}: this browser can't read that image format. Please use a JPEG or PNG.`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob && blob.size <= TARGET_BYTES) return blob;
  }
  throw new Error(`${file.name}: could not shrink this photo enough to upload.`);
}

/** Prepares, uploads, and returns the compressed Blob URL. */
export async function uploadImage(
  file: File,
  options: { folder?: string; maxDimension?: number } = {},
): Promise<UploadResult> {
  const prepared = await prepareForUpload(file);
  const form = new FormData();
  form.set('file', prepared, file.name);
  form.set('originalSize', String(file.size));
  if (options.folder) form.set('folder', options.folder);
  if (options.maxDimension) form.set('maxDimension', String(options.maxDimension));

  const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${file.name}: upload failed (${response.status}).`);
  return data as UploadResult;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
