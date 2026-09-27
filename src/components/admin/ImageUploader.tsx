'use client';

import { useState } from 'react';
import { formatBytes, uploadImage } from '@/lib/image/prepare-upload';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
  /** Longest edge after compression; hero images use a larger size. */
  maxDimension?: number;
  folder?: string;
}

export function ImageUploader({ label, value, onUploaded, maxDimension, folder }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(null);
    try {
      const result = await uploadImage(file, { maxDimension, folder });
      setSaved(`Compressed ${formatBytes(result.originalSize)} → ${formatBytes(result.size)}`);
      onUploaded(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={label} className="h-32 w-full max-w-xs rounded-md object-cover sm:h-40" />
      )}
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
      {uploading && <p className="text-sm text-black/60">Compressing and uploading…</p>}
      {saved && <p className="text-sm text-green-700">{saved}. Remember to save.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
