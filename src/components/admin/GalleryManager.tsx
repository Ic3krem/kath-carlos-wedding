'use client';

import { useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { formatBytes, uploadImage } from '@/lib/image/prepare-upload';

interface QueueItem {
  key: string;
  name: string;
  status: 'waiting' | 'uploading' | 'done' | 'error';
  detail?: string;
}

/** Uploads run a couple at a time so a big batch doesn't swamp the connection. */
const CONCURRENCY = 2;

export function GalleryManager({ initial }: { initial: GalleryImage[] }) {
  const [images, setImages] = useState(initial);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setItem = (key: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    setError(null);

    const items = files.map((file, i) => ({ file, key: `${Date.now()}-${i}-${file.name}` }));
    setQueue(items.map(({ key, file }) => ({ key, name: file.name, status: 'waiting' })));

    let next = images.reduce((max, img) => Math.max(max, img.sort_order), -1) + 1;
    let cursor = 0;

    async function worker() {
      while (cursor < items.length) {
        const { file, key } = items[cursor++];
        const sortOrder = next++;
        setItem(key, { status: 'uploading' });
        try {
          const result = await uploadImage(file, { folder: 'gallery' });
          const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: result.url, caption: null, sort_order: sortOrder }),
          });
          if (!response.ok) throw new Error('Saved the file but could not add it to the gallery.');
          const created = (await response.json()) as GalleryImage;
          setImages((curr) => [...curr, created].sort((a, b) => a.sort_order - b.sort_order));
          setItem(key, { status: 'done', detail: `${formatBytes(result.originalSize)} → ${formatBytes(result.size)}` });
        } catch (err) {
          setItem(key, { status: 'error', detail: err instanceof Error ? err.message : 'Upload failed' });
        }
      }
    }

    setBusy(true);
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
    setBusy(false);
  }

  async function update(id: string, patch: Partial<Pick<GalleryImage, 'caption' | 'sort_order'>>) {
    const response = await fetch(`/api/admin/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new Error('Could not save that change.');
    return (await response.json()) as GalleryImage;
  }

  async function move(index: number, direction: -1 | 1) {
    const other = index + direction;
    if (other < 0 || other >= images.length) return;
    setError(null);
    const a = images[index];
    const b = images[other];
    // Swap positions; fall back to the index when two rows share a sort_order.
    const aOrder = b.sort_order === a.sort_order ? other : b.sort_order;
    const bOrder = b.sort_order === a.sort_order ? index : a.sort_order;
    const reordered = [...images];
    reordered[index] = { ...b, sort_order: bOrder };
    reordered[other] = { ...a, sort_order: aOrder };
    setImages(reordered);
    try {
      await Promise.all([update(a.id, { sort_order: aOrder }), update(b.id, { sort_order: bOrder })]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reorder.');
      setImages(images);
    }
  }

  async function saveCaption(id: string, caption: string) {
    setError(null);
    try {
      const saved = await update(id, { caption });
      setImages((curr) => curr.map((img) => (img.id === id ? saved : img)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save caption.');
    }
  }

  async function removeImage(id: string) {
    if (!window.confirm('Remove this photo from the gallery? The file is deleted from storage too.')) return;
    setError(null);
    const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setImages((curr) => curr.filter((image) => image.id !== id));
    } else {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Gallery</h1>
        <p className="text-sm text-black/60">
          Photos are resized to 2000px and converted to WebP before they are stored, so full-size camera files are fine.
          The first six appear on the page; the rest open under “View more photos”.
          {images.length === 0 && ' Until you add one, the site shows the sample photos.'}
        </p>
      </header>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-black/20 p-8 text-center hover:border-black/40">
        <span className="font-medium">{busy ? 'Uploading…' : 'Choose photos to upload'}</span>
        <span className="text-sm text-black/60">JPEG, PNG or WebP · select as many as you like</span>
        <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={busy} className="sr-only" />
      </label>

      {queue.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {queue.map((item) => (
            <li key={item.key} className="flex justify-between gap-4 border-b border-black/5 py-1">
              <span className="truncate">{item.name}</span>
              <span
                className={
                  item.status === 'error' ? 'text-red-600' : item.status === 'done' ? 'text-green-700' : 'text-black/60'
                }
              >
                {item.status === 'waiting' && 'Waiting'}
                {item.status === 'uploading' && 'Compressing & uploading…'}
                {item.status === 'done' && `Done · ${item.detail}`}
                {item.status === 'error' && item.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <div key={image.id} className="flex flex-col gap-2 rounded-md border border-black/10 p-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.image_url} alt={image.caption ?? ''} className="h-36 w-full rounded object-cover" />
              <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white">
                {i + 1}
                {i < 6 ? ' · on page' : ''}
              </span>
            </div>
            <input
              placeholder="Caption (optional)"
              defaultValue={image.caption ?? ''}
              onBlur={(e) => e.target.value !== (image.caption ?? '') && saveCaption(image.id, e.target.value)}
              className="rounded border border-black/20 px-2 py-1 text-sm"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded border px-2 disabled:opacity-30" aria-label="Move earlier">
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="rounded border px-2 disabled:opacity-30"
                  aria-label="Move later"
                >
                  →
                </button>
              </span>
              <button type="button" onClick={() => removeImage(image.id)} className="text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
