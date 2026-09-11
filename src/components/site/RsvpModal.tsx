'use client';

import { useState } from 'react';
import { useRsvpModal } from '@/lib/rsvp-modal-context';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  attending: true,
  guest_count: 1,
  meal_preference: '',
  message: '',
};

export function RsvpModal() {
  const { open, closeModal } = useRsvpModal();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!open) return null;

  function handleClose() {
    setForm(initialForm);
    setStatus('idle');
    closeModal();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'success' : 'error');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-secondary p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">RSVP</h2>
          <button onClick={handleClose} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        {status === 'success' ? (
          <p className="text-green-700">Thank you! Your RSVP has been received.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.attending} onChange={(e) => setForm({ ...form, attending: e.target.checked })} />
              I will be attending
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <input placeholder="Meal preference" value={form.meal_preference} onChange={(e) => setForm({ ...form, meal_preference: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <textarea placeholder="Message to the couple" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-20 rounded-md border border-black/20 px-3 py-2" />
            <button type="submit" disabled={status === 'submitting'} className="rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">
              {status === 'submitting' ? 'Submitting…' : 'Submit RSVP'}
            </button>
            {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
