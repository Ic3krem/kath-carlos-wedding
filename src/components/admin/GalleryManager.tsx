'use client';

import { useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { ImageUploader } from './ImageUploader';

export function GalleryManager({ initial }: { initial: GalleryImage[] }) {
  const [images, setImages] = useState(initial);
  const [caption, setCaption] = useState('');

  async function handleUploaded(url: string) {
    const response = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, caption: caption || null, sort_order: images.length }),
    });
    if (response.ok) {
      const created = await response.json();
      setImages([...images, created]);
      setCaption('');
    }
  }

  async function removeImage(id: string) {
    const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setImages(images.filter((image) => image.id !== id));
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.image_url} alt={image.caption ?? ''} className="h-32 w-full rounded-md object-cover" />
            <button onClick={() => removeImage(image.id)} className="absolute right-1 top-1 rounded bg-black/70 px-2 text-xs text-white">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Add photo</h2>
        <input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="rounded-md border border-black/20 px-3 py-2" />
        <ImageUploader label="Upload photo" value={null} onUploaded={handleUploaded} />
      </div>
    </div>
  );
}
