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
        <label className="text-sm font-medium">Hero message</label>
        <textarea
          className="rounded-md border border-black/20 px-3 py-2"
          rows={3}
          value={form.hero_message}
          onChange={(e) => setForm({ ...form, hero_message: e.target.value })}
        />
        <p className="text-xs text-black/50">Shown above the RSVP button on the hero.</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">RSVP due date</label>
        <input
          type="datetime-local"
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.rsvp_due_date ? toLocalDatetimeInputValue(form.rsvp_due_date) : ''}
          onChange={(e) =>
            setForm({ ...form, rsvp_due_date: e.target.value ? new Date(e.target.value).toISOString() : null })
          }
        />
      </div>
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
      <fieldset className="flex flex-col gap-4 rounded-md border border-black/10 p-4">
        <legend className="px-1 text-sm font-semibold">Ceremony venue</legend>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Name</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.ceremony_name ?? ''}
            onChange={(e) => setForm({ ...form, ceremony_name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Address</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.ceremony_address ?? ''}
            onChange={(e) => setForm({ ...form, ceremony_address: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Google Maps embed URL</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.ceremony_embed_url ?? ''}
            onChange={(e) => setForm({ ...form, ceremony_embed_url: e.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-md border border-black/10 p-4">
        <legend className="px-1 text-sm font-semibold">Reception venue</legend>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Name</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.reception_name ?? ''}
            onChange={(e) => setForm({ ...form, reception_name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Address</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.reception_address ?? ''}
            onChange={(e) => setForm({ ...form, reception_address: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Google Maps embed URL</label>
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            value={form.reception_embed_url ?? ''}
            onChange={(e) => setForm({ ...form, reception_embed_url: e.target.value })}
          />
        </div>
      </fieldset>
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save settings'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Failed to save.</p>}
    </form>
  );
}
