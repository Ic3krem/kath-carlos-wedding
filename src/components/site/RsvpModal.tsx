'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-lg bg-secondary p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">RSVP</h2>
          <button onClick={handleClose} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        {status === 'success' ? (
          <p className="text-green-700" aria-live="polite">Thank you! Your RSVP has been received.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="rsvp-name">
              Full name
            </label>
            <input
              id="rsvp-name"
              required
              type="text"
              name="name"
              autoComplete="name"
              spellCheck={false}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <label className="sr-only" htmlFor="rsvp-email">
              Email
            </label>
            <input
              id="rsvp-email"
              required
              type="email"
              inputMode="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <label className="sr-only" htmlFor="rsvp-phone">
              Phone
            </label>
            <input
              id="rsvp-phone"
              type="tel"
              inputMode="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="attending"
                checked={form.attending}
                onChange={(e) => setForm({ ...form, attending: e.target.checked })}
              />
              I will be attending
            </label>
            <label className="sr-only" htmlFor="rsvp-guest-count">
              Number of guests
            </label>
            <input
              id="rsvp-guest-count"
              type="number"
              name="guest_count"
              inputMode="numeric"
              autoComplete="off"
              min={1}
              max={20}
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <label className="sr-only" htmlFor="rsvp-meal-preference">
              Meal preference
            </label>
            <input
              id="rsvp-meal-preference"
              type="text"
              name="meal_preference"
              autoComplete="off"
              placeholder="Meal preference"
              value={form.meal_preference}
              onChange={(e) => setForm({ ...form, meal_preference: e.target.value })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <label className="sr-only" htmlFor="rsvp-message">
              Message to the couple
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              autoComplete="off"
              placeholder="Message to the couple"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="min-h-20 rounded-md border border-black/20 px-3 py-2"
            />
            <button type="submit" disabled={status === 'submitting'} className="rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">
              {status === 'submitting' ? 'Submitting…' : 'Submit RSVP'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600" aria-live="polite">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
