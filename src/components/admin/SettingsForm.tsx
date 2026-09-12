'use client';

import { useState } from 'react';
import type { Settings } from '@/lib/types';
import { THEMES } from '@/lib/theme';
import { toLocalDatetimeInputValue } from '@/lib/date-utils';
import { ImageUploader } from './ImageUploader';

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Couple names</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.couple_names}
          onChange={(e) => setForm({ ...form, couple_names: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Wedding date</label>
        <input
          type="datetime-local"
          className="rounded-md border border-black/20 px-3 py-2"
          value={toLocalDatetimeInputValue(form.wedding_date)}
          onChange={(e) => setForm({ ...form, wedding_date: new Date(e.target.value).toISOString() })}
        />
      </div>
      <ImageUploader
        label="Hero background image"
        value={form.hero_image_url}
        onUploaded={(url) => setForm((curr) => ({ ...curr, hero_image_url: url }))}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Theme</label>
        <select
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.theme}
          onChange={(e) => setForm({ ...form, theme: e.target.value })}
        >
          {Object.entries(THEMES).map(([key, def]) => (
            <option key={key} value={key}>{def.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Venue address</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.maps_address ?? ''}
          onChange={(e) => setForm({ ...form, maps_address: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Google Maps embed URL</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.maps_embed_url ?? ''}
          onChange={(e) => setForm({ ...form, maps_embed_url: e.target.value })}
        />
      </div>
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save settings'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Failed to save.</p>}
    </form>
  );
}
