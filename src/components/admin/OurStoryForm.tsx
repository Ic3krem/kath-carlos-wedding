'use client';

import { useState } from 'react';
import type { OurStory } from '@/lib/types';
import { ImageUploader } from './ImageUploader';

export function OurStoryForm({ initial }: { initial: OurStory }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    const response = await fetch('/api/admin/our-story', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <ImageUploader label="Story image" value={form.image_url} onUploaded={(url) => setForm({ ...form, image_url: url })} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Title</label>
        <input className="rounded-md border border-black/20 px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Excerpt (shown on the page)</label>
        <textarea className="min-h-24 rounded-md border border-black/20 px-3 py-2" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Full story (shown in the modal)</label>
        <textarea className="min-h-48 rounded-md border border-black/20 px-3 py-2" value={form.full_story} onChange={(e) => setForm({ ...form, full_story: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Button label</label>
        <input className="rounded-md border border-black/20 px-3 py-2" value={form.button_label} onChange={(e) => setForm({ ...form, button_label: e.target.value })} />
      </div>
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save story'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Failed to save.</p>}
    </form>
  );
}
