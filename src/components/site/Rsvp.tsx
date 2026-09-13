'use client';

import { useState } from 'react';
import { Reveal } from './Reveal';
import { SectionIntro } from './SectionIntro';

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

// Underlined fields, as in the reference — the border is the only chrome.
const FIELD_CLASS =
  'w-full border-0 border-b border-black/15 bg-transparent px-0 py-2 text-sm text-black transition-colors duration-300 placeholder:text-black/30 focus:border-accent';
const LABEL_CLASS = 'text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45';
const STEP_CLASS = 'flex items-center gap-2.5 text-lg text-black';
const STEP_BADGE =
  'flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white';

/** Chips write into the free-text allergies field the API already accepts. */
const DIET_CHIPS = ['Gluten-free', 'Vegetarian', 'Vegan', 'Seafood allergy', 'Nut allergy'];

function Step({ number, title }: { number: number; title: string }) {
  return (
    <h3 className={STEP_CLASS}>
      <span className={STEP_BADGE}>{number}</span>
      {title}
    </h3>
  );
}

export function Rsvp({ weddingDate }: { weddingDate: string }) {
  const [form, setForm] = useState(initialForm);
  const [diets, setDiets] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const formatted = new Date(weddingDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  function toggleDiet(diet: string) {
    setDiets((current) =>
      current.includes(diet) ? current.filter((d) => d !== diet) : [...current, diet]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    // The chips and the free-text box both describe dietary needs, so they are
    // merged into the one column the API stores.
    const allergies = [diets.join(', '), form.allergies].filter(Boolean).join(' — ');
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, allergies }),
    }).catch(() => null);
    setStatus(response?.ok ? 'success' : 'error');
  }

  const attending = form.attending;

  return (
    <section
      id="rsvp"
      className="flex w-full flex-col items-center gap-10 px-1.5 py-12 sm:px-3 sm:py-16 lg:px-6 lg:py-20"
    >
      <SectionIntro
        eyebrow="Chapter V • The favour of your reply"
        title="RSVP"
        blurb={`We would love to celebrate with you on ${formatted}. Kindly reply so we can save you a seat.`}
      />

      {status === 'success' ? (
        <p
          className="max-w-xl rounded-2xl border border-black/10 bg-white px-8 py-6 text-center text-black/70 shadow-sm"
          aria-live="polite"
        >
          Thank you — your RSVP has been received. We cannot wait to celebrate with you.
        </p>
      ) : (
        <Reveal className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-md sm:p-10 lg:p-14">
          {/* Watermark monogram, as in the reference */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-8 top-4 select-none font-script text-7xl text-black/[0.05]"
          >
            RSVP
          </span>

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-8">
            {/* Step 1 — who is replying */}
            <div className="flex flex-col gap-4">
              <Step number={1} title="Your details" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS} htmlFor="rsvp-name">
                    Full name *
                  </label>
                  <input
                    id="rsvp-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    spellCheck={false}
                    required
                    placeholder="e.g. Maria Santos"
                    className={FIELD_CLASS}
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS} htmlFor="rsvp-email">
                    Email *
                  </label>
                  <input
                    id="rsvp-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    placeholder="you@example.com"
                    className={FIELD_CLASS}
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS} htmlFor="rsvp-phone">
                    Contact number
                  </label>
                  <input
                    id="rsvp-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+63 917 000 0000"
                    className={FIELD_CLASS}
                    value={form.phone}
                    onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL_CLASS} htmlFor="rsvp-guest-count">
                    Total in your party
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
            </div>

            {/* Step 2 — attendance, as two selectable cards */}
            <fieldset className="flex flex-col gap-4 border-t border-black/10 pt-6">
              <legend className="sr-only">Will you be joining us?</legend>
              <Step number={2} title="Will you be joining us?" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { value: true, label: 'Joyfully accepts', note: 'We will be there' },
                  { value: false, label: 'Regretfully declines', note: 'Sending love from afar' },
                ].map((option) => (
                  <label
                    key={option.label}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${
                      attending === option.value
                        ? 'border-accent bg-accent/[0.08]'
                        : 'border-black/10 hover:border-accent/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attending"
                      className="h-4 w-4 accent-[color:var(--color-accent)]"
                      checked={attending === option.value}
                      onChange={() => setForm((c) => ({ ...c, attending: option.value }))}
                    />
                    <span>
                      <span className="block text-sm text-black">{option.label}</span>
                      <span className="block text-xs text-black/45">{option.note}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {attending && (
              <>
                {/* Step 3 — the rest of the party */}
                <div className="flex flex-col gap-4 border-t border-black/10 pt-6">
                  <Step number={3} title="Who is coming with you?" />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className={LABEL_CLASS} htmlFor="rsvp-guest-names">
                        Names of your guests
                      </label>
                      <input
                        id="rsvp-guest-names"
                        name="guest_names"
                        type="text"
                        placeholder="So we can print their place cards"
                        className={FIELD_CLASS}
                        value={form.guest_names}
                        onChange={(e) => setForm((c) => ({ ...c, guest_names: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
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
                  </div>
                </div>

                {/* Step 4 — dietary chips plus a free-text catch-all */}
                <fieldset className="flex flex-col gap-4 border-t border-black/10 pt-6">
                  <legend className="sr-only">Dietary requirements</legend>
                  <Step number={4} title="Anything we should know?" />
                  <div className="flex flex-wrap gap-3">
                    {DIET_CHIPS.map((diet) => (
                      <label
                        key={diet}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-300 ${
                          diets.includes(diet)
                            ? 'border-accent bg-accent/[0.08] text-black'
                            : 'border-black/10 text-black/60 hover:border-accent/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded accent-[color:var(--color-accent)]"
                          checked={diets.includes(diet)}
                          onChange={() => toggleDiet(diet)}
                        />
                        {diet}
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={LABEL_CLASS} htmlFor="rsvp-allergies">
                      Other allergies or dietary needs
                    </label>
                    <input
                      id="rsvp-allergies"
                      name="allergies"
                      type="text"
                      placeholder="For anyone in your party"
                      className={FIELD_CLASS}
                      value={form.allergies}
                      onChange={(e) => setForm((c) => ({ ...c, allergies: e.target.value }))}
                    />
                  </div>
                </fieldset>
              </>
            )}

            {/* Step 5 — song and note */}
            <div className="grid grid-cols-1 gap-6 border-t border-black/10 pt-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="rsvp-song">
                  Song request
                </label>
                <input
                  id="rsvp-song"
                  name="song_request"
                  type="text"
                  placeholder="What will get you on the floor?"
                  className={FIELD_CLASS}
                  value={form.song_request}
                  onChange={(e) => setForm((c) => ({ ...c, song_request: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={LABEL_CLASS} htmlFor="rsvp-message">
                  A note for the couple
                </label>
                <input
                  id="rsvp-message"
                  name="message"
                  type="text"
                  placeholder="Share a wish or a word"
                  className={FIELD_CLASS}
                  value={form.message}
                  onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-full bg-black px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition-colors duration-300 hover:bg-accent disabled:opacity-60 sm:w-auto"
              >
                {status === 'submitting' ? 'Sending…' : 'Send our reply'}
              </button>

              {status === 'error' && (
                <p className="text-center text-sm text-red-700" aria-live="polite">
                  Something went wrong. Please check your details and try again.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      )}
    </section>
  );
}
