'use client';

import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  attending: true,
  guest_count: 1,
  guest_names: '',
  meal_preference: '',
  allergies: '',
  song_request: '',
  message: '',
};

const FIELD_CLASS =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/35';
const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wide text-black/60';

export function Rsvp({ weddingDate }: { weddingDate: string }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const formatted = new Date(weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    setStatus(response?.ok ? 'success' : 'error');
  }

  const attending = form.attending;

  return (
    <section id="rsvp" className="flex w-full flex-col items-center gap-6 px-1.5 py-12 sm:px-3 sm:py-16 lg:px-6 lg:py-20">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">RSVP</h2>
      <p className="max-w-xl text-center text-black/60">
        We would love to celebrate with you on {formatted}. Kindly reply by filling in the form below so we can
        save you a seat.
      </p>

      {status === 'success' ? (
        <p
          className="max-w-xl rounded-md border border-black/10 bg-white px-6 py-5 text-center text-black/70"
          aria-live="polite"
        >
          Thank you — your RSVP has been received. We cannot wait to celebrate with you.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS} htmlFor="rsvp-name">
                Full name
              </label>
              <input
                id="rsvp-name"
                name="name"
                type="text"
                autoComplete="name"
                spellCheck={false}
                required
                className={FIELD_CLASS}
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS} htmlFor="rsvp-email">
                Email
              </label>
              <input
                id="rsvp-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                required
                className={FIELD_CLASS}
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS} htmlFor="rsvp-phone">
                Contact number
              </label>
              <input
                id="rsvp-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={FIELD_CLASS}
                value={form.phone}
                onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS} htmlFor="rsvp-guest-count">
                Total attending (including you)
              </label>
              <input
                id="rsvp-guest-count"
                name="guest_count"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                className={FIELD_CLASS}
                value={form.guest_count}
                onChange={(e) => setForm((c) => ({ ...c, guest_count: Number(e.target.value) }))}
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className={LABEL_CLASS}>Will you be joining us?</legend>
            <div className="flex flex-wrap gap-4 pt-1">
              {[
                { value: true, label: 'Joyfully accepts' },
                { value: false, label: 'Regretfully declines' },
              ].map((option) => (
                <label key={option.label} className="flex items-center gap-2 text-sm text-black/70">
                  <input
                    type="radio"
                    name="attending"
                    checked={attending === option.value}
                    onChange={() => setForm((c) => ({ ...c, attending: option.value }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {attending && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS} htmlFor="rsvp-guest-names">
                  Names of guests joining you
                </label>
                <input
                  id="rsvp-guest-names"
                  name="guest_names"
                  type="text"
                  className={FIELD_CLASS}
                  placeholder="So we can prepare their place cards"
                  value={form.guest_names}
                  onChange={(e) => setForm((c) => ({ ...c, guest_names: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS} htmlFor="rsvp-meal">
                    Meal preference
                  </label>
                  <select
                    id="rsvp-meal"
                    name="meal_preference"
                    className={FIELD_CLASS}
                    value={form.meal_preference}
                    onChange={(e) => setForm((c) => ({ ...c, meal_preference: e.target.value }))}
                  >
                    <option value="">No preference</option>
                    <option value="Chicken">Chicken</option>
                    <option value="Beef">Beef</option>
                    <option value="Fish">Fish</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS} htmlFor="rsvp-song">
                    Song request
                  </label>
                  <input
                    id="rsvp-song"
                    name="song_request"
                    type="text"
                    className={FIELD_CLASS}
                    placeholder="A song that will get you dancing"
                    value={form.song_request}
                    onChange={(e) => setForm((c) => ({ ...c, song_request: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS} htmlFor="rsvp-allergies">
                  Allergies or dietary needs
                </label>
                <input
                  id="rsvp-allergies"
                  name="allergies"
                  type="text"
                  className={FIELD_CLASS}
                  placeholder="For anyone in your party"
                  value={form.allergies}
                  onChange={(e) => setForm((c) => ({ ...c, allergies: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={LABEL_CLASS} htmlFor="rsvp-message">
              A message for the couple
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              rows={3}
              className={FIELD_CLASS}
              value={form.message}
              onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mx-auto mt-1 rounded-md bg-black px-10 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : 'Send RSVP'}
          </button>

          {status === 'error' && (
            <p className="text-center text-sm text-red-700" aria-live="polite">
              Something went wrong. Please check your details and try again.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
