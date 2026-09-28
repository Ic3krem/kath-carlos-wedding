'use client';

import { useEffect, useRef, useState } from 'react';
import { MIN_QUERY, normName } from '@/lib/rsvp/guests';
import type { RsvpResponse, RsvpSummary } from '@/lib/rsvp/summary';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

interface Guest {
  name: string;
  companions: number;
}

/** A saved RSVP; `previous` when it was already on file before this visit. */
type Done = RsvpSummary & { previous: boolean };

const RESPONSE_LABEL: Record<RsvpResponse, string> = {
  yes: 'Joyfully Accepts',
  no: 'Regretfully Declines',
  proxy: 'Sending a proxy',
};

type Hint = { tone: '' | 'ok' | 'err' | 'wait'; text: string };

const NOT_FOUND = "We couldn't find that name. Please type your name as it appears on your invitation.";
const HINT_COLOR: Record<Hint['tone'], string> = { '': 'text-white', ok: 'text-mist', err: 'text-[#ffe1db]', wait: 'text-white/80 italic' };
const FIELD_LABEL = 'mb-2 block text-xs font-normal uppercase tracking-[0.12em] text-mist';
const FIELD =
  'w-full rounded border border-transparent bg-white px-3.5 py-[13px] font-lato text-base text-ink outline-none focus:border-mist focus:shadow-[0_0_0_2px_rgba(220,231,240,0.5)]';

interface RsvpProps {
  coupleNames: string;
  dateLabel: string;
  dueLabel: string | null;
}

export function Rsvp({ coupleNames, dateLabel, dueLabel }: RsvpProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [hint, setHint] = useState<Hint>({ tone: '', text: '' });
  const [guest, setGuest] = useState<Guest | null>(null);
  const [response, setResponse] = useState<RsvpResponse | null>(null);
  const [proxyName, setProxyName] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState<Done | null>(null);

  const suggestTimer = useRef<ReturnType<typeof setTimeout>>();
  const requestId = useRef(0);

  useEffect(() => () => clearTimeout(suggestTimer.current), []);

  const [firstName, ...rest] = coupleNames.split('&').map((s) => s.trim());
  const secondName = rest.join(' & ');

  async function lookup(name: string) {
    const my = ++requestId.current;
    setHint({ tone: 'wait', text: 'Looking for your invitation…' });
    try {
      const res = await fetch(`/api/rsvp/guests?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (my !== requestId.current) return;
      if (!data.found) return setHint({ tone: 'err', text: NOT_FOUND });
      setQuery(data.name);
      setResponse(null);
      setProxyName('');
      setCompanions([]);
      if (data.rsvp) {
        setGuest(null);
        setHint({ tone: '', text: '' });
        setDone({ ...(data.rsvp as RsvpSummary), previous: true });
        return;
      }
      setGuest({ name: data.name, companions: data.companions });
      setHint({ tone: 'ok', text: `Welcome, ${data.name}!` });
    } catch {
      if (my === requestId.current) setHint({ tone: 'err', text: 'Something went wrong. Please try again.' });
    }
  }

  async function suggest(value: string) {
    const my = ++requestId.current;
    try {
      const res = await fetch(`/api/rsvp/guests?q=${encodeURIComponent(value)}`);
      const { names } = (await res.json()) as { names: string[] };
      if (my !== requestId.current) return;
      const exact = names.find((n) => normName(n) === normName(value));
      if (exact) {
        setSuggestions([]);
        return lookup(exact);
      }
      if (names.length === 0) {
        setSuggestions([]);
        return setHint({ tone: 'err', text: NOT_FOUND });
      }
      setSuggestions(names);
      setActive(-1);
      setHint({ tone: '', text: 'Tap your name below to continue.' });
    } catch {
      if (my === requestId.current) setHint({ tone: 'err', text: 'Something went wrong. Please try again.' });
    }
  }

  function onInput(value: string) {
    clearTimeout(suggestTimer.current);
    requestId.current++;
    setQuery(value);
    setGuest(null);
    setResponse(null);
    setProxyName('');
    setCompanions([]);
    setMessage('');
    if (normName(value).replace(/ /g, '').length < MIN_QUERY) {
      setSuggestions([]);
      return setHint({ tone: '', text: value.trim() ? 'Keep typing…' : '' });
    }
    setHint({ tone: 'wait', text: 'Looking for your invitation…' });
    suggestTimer.current = setTimeout(() => suggest(value), 350);
  }

  function pick(name: string) {
    setQuery(name);
    setSuggestions([]);
    lookup(name);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = suggestions.length;
    if (!n) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(suggestions[active < 0 ? 0 : active]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!guest || response === null) return;
    const names = response !== 'no' ? companions.map((c) => c.trim()) : [];
    const missing = names.findIndex((c) => !c);
    if (missing >= 0) return setMessage(`Please enter the name of companion ${missing + 1}.`);
    if (response === 'proxy' && !proxyName.trim()) {
      return setMessage('Please enter the name of the person attending on your behalf.');
    }
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guest.name, response, companions: names, proxyName: proxyName.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data.rsvp) {
        setDone({ ...(data.rsvp as RsvpSummary), previous: true });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'We could not save your RSVP. Please try again.');
      setDone({ ...(data as RsvpSummary), previous: false });
      window.dispatchEvent(new CustomEvent('petal-burst', { detail: { mode: 'sides', count: data.response === 'no' ? 60 : 160 } }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  const choice = (on: boolean) =>
    `block w-full cursor-pointer rounded px-2.5 py-4 text-center font-serif text-[19px] text-white ${
      on ? 'border border-mist bg-[rgba(28,45,64,0.28)] shadow-[inset_0_0_0_1px_#dce7f0]' : 'border border-white/35 bg-transparent'
    }`;
  const cantSubmit = response === null || sending;
  const first = done?.name.split(' ')[0] ?? '';
  const pick_ = (r: RsvpResponse) => {
    setResponse(r);
    setMessage('');
  };
  const resetSearch = () => {
    setDone(null);
    setGuest(null);
    setQuery('');
    setHint({ tone: '', text: '' });
  };

  return (
    <section id="rsvp" className="bg-paper px-6 py-[88px]">
      <Reveal className="mx-auto flex max-w-[720px] flex-col items-center gap-2 text-center">
        <SectionHeading eyebrow="RSVP" title="Will you be joining us?" />
        <p className="m-0 mt-2 text-[19px] leading-relaxed text-body">
          We would love to celebrate with you on {dateLabel}. Kindly reply so we can save you a seat.
        </p>
      </Reveal>

      <Reveal from="scale" delay={150} className="mt-9">
        <div className="relative mx-auto box-border w-full max-w-[520px] rounded-md border border-mist bg-steel px-[clamp(20px,5vw,36px)] py-11 font-lato font-light text-white shadow-[0_14px_44px_rgba(28,45,64,0.35)] outline outline-1 -outline-offset-[10px] outline-[rgba(220,231,240,0.45)]">
          {!done ? (
            <div>
              <div className="text-center text-[11px] uppercase tracking-[0.3em] text-mist">The Wedding of</div>
              <h3 className="mb-1 mt-2.5 text-center font-serif text-[clamp(34px,6vw,42px)] font-normal text-white">
                {firstName} {secondName && <span className="italic text-mist">&amp;</span>} {secondName}
              </h3>
              <p className="mb-3 mt-2.5 text-center text-[17px] font-bold uppercase tracking-[0.3em] text-mist">{dateLabel}</p>
              <p className="mb-2 mt-0 text-center font-serif text-xl italic text-mist">Wedding RSVP</p>
              <div className="mx-auto mb-[30px] mt-[22px] h-px w-[60px] bg-mist" />

              <form onSubmit={submit} autoComplete="off" noValidate>
                <div className="mb-[26px]">
                  <label htmlFor="rsvp-name" className={FIELD_LABEL}>
                    Name of Guest
                  </label>
                  <div className="relative">
                    <input
                      id="rsvp-name"
                      type="text"
                      value={query}
                      onChange={(e) => onInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                      placeholder="Start typing your first name"
                      role="combobox"
                      aria-expanded={suggestions.length > 0}
                      aria-controls="rsvp-suggestions"
                      aria-autocomplete="list"
                      className={FIELD}
                    />
                    {suggestions.length > 0 && (
                      <ul
                        id="rsvp-suggestions"
                        role="listbox"
                        className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 m-0 list-none rounded border border-mist bg-white py-1 shadow-[0_10px_24px_rgba(28,45,64,0.3)]"
                      >
                        <li className="px-3.5 pb-1 pt-1.5 text-[11px] uppercase tracking-[0.15em] text-[#7d8fa0]">Is this you?</li>
                        {suggestions.map((name, i) => (
                          <li
                            key={name}
                            role="option"
                            aria-selected={i === active}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pick(name);
                            }}
                            className={`cursor-pointer px-3.5 py-[11px] text-base text-ink ${i === active ? 'bg-haze' : ''}`}
                          >
                            <Highlighted name={name} query={query} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {dueLabel && (
                    <div className="mt-3.5 rounded border border-[rgba(220,231,240,0.7)] bg-[rgba(28,45,64,0.15)] px-3 py-2.5 text-center text-[11px] font-normal uppercase tracking-[0.2em] text-white/80">
                      Kindly submit your RSVP before
                      <b className="ml-1 whitespace-nowrap font-bold tracking-[0.15em] text-mist">{dueLabel}</b>
                    </div>
                  )}
                  <div aria-live="polite" className={`mt-2.5 min-h-5 text-sm ${HINT_COLOR[hint.tone]}`}>
                    {hint.text}
                  </div>
                </div>

                {guest && (
                  <div>
                    <div className="mb-[26px] rounded border border-dashed border-mist bg-[rgba(28,45,64,0.18)] p-4 text-center font-serif text-xl">
                      We have reserved{' '}
                      <strong className="text-[26px] font-semibold text-mist">{guest.companions > 0 ? guest.companions : 1}</strong>
                      {guest.companions > 0
                        ? ` companion seat${guest.companions > 1 ? 's' : ''} in your name`
                        : ' seat in your honor'}
                    </div>

                    <div className="mb-[26px]">
                      <span className={FIELD_LABEL}>Will you be attending?</span>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
                        <button type="button" onClick={() => pick_('yes')} className={choice(response === 'yes')} aria-pressed={response === 'yes'}>
                          Joyfully Accepts
                          <small className="mt-1 block font-lato text-[11px] uppercase tracking-[0.1em] text-white/80">Can&apos;t wait to celebrate</small>
                        </button>
                        <button type="button" onClick={() => pick_('no')} className={choice(response === 'no')} aria-pressed={response === 'no'}>
                          Regretfully Declines
                          <small className="mt-1 block font-lato text-[11px] uppercase tracking-[0.1em] text-white/80">Celebrating in spirit</small>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => pick_('proxy')}
                        className={`${choice(response === 'proxy')} mt-3 !py-3 !text-[17px]`}
                        aria-pressed={response === 'proxy'}
                      >
                        I can&apos;t attend, but I&apos;m sending a proxy
                        <small className="mt-1 block font-lato text-[11px] uppercase tracking-[0.1em] text-white/80">Someone will take my seat</small>
                      </button>
                    </div>

                    {response === 'proxy' && (
                      <div className="mb-[26px]">
                        <label htmlFor="rsvp-proxy" className={FIELD_LABEL}>
                          Name of the person attending on your behalf
                        </label>
                        <input
                          id="rsvp-proxy"
                          type="text"
                          value={proxyName}
                          onChange={(e) => setProxyName(e.target.value)}
                          placeholder="Full name"
                          className={FIELD}
                        />
                      </div>
                    )}

                    {response !== null && response !== 'no' && guest.companions > 0 && (
                      <div>
                        <div className="mb-[26px]">
                          <label htmlFor="rsvp-count" className={FIELD_LABEL}>
                            {response === 'proxy' ? 'How many companions will your proxy bring?' : 'How many companions will you bring?'}
                          </label>
                          <select
                            id="rsvp-count"
                            value={companions.length}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10) || 0;
                              setCompanions((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ''));
                            }}
                            className={FIELD}
                          >
                            {Array.from({ length: guest.companions + 1 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0 ? (response === 'proxy' ? 'Just the proxy' : 'Just me') : `${i} companion${i > 1 ? 's' : ''}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        {companions.length > 0 && (
                          <div className="mb-[26px] flex flex-col gap-3">
                            {companions.map((value, i) => (
                              <div key={i}>
                                <label htmlFor={`rsvp-companion-${i}`} className={FIELD_LABEL}>
                                  Companion {i + 1} Name
                                </label>
                                <input
                                  id={`rsvp-companion-${i}`}
                                  type="text"
                                  value={value}
                                  placeholder="Full name"
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setCompanions((prev) => prev.map((c, j) => (j === i ? v : c)));
                                  }}
                                  className={FIELD}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={cantSubmit}
                      className={`btn-shine w-full rounded border-0 bg-mist p-[15px] font-lato text-sm font-bold uppercase tracking-[0.2em] text-ink ${
                        cantSubmit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                    >
                      {sending ? 'Sending…' : 'Send RSVP'}
                    </button>
                    {message && <div className="mt-2.5 text-center text-sm text-[#ffe1db]">{message}</div>}
                    <div className="mt-2.5 text-center text-[12px] text-white/70">Each invitation can RSVP once, so please check before sending.</div>
                  </div>
                )}
              </form>

              <div className="mt-[34px] border-t border-[rgba(220,231,240,0.5)] pt-[26px] text-center font-serif text-lg italic leading-relaxed text-white">
                <p className="mb-3.5 mt-0">
                  Each seat has been <strong className="font-bold text-mist">thoughtfully reserved</strong> in your honour. We kindly ask
                  that you refer to the number of seats indicated on your invitation when confirming your attendance.
                </p>
                <p className="m-0">
                  To ensure a <strong className="font-bold text-mist">seamless celebration</strong>, only guests named on the invitation
                  and with confirmed RSVPs will be accommodated.{' '}
                  <strong className="font-semibold not-italic tracking-[0.04em] text-mist">STRICTLY NO PLUS-ONES.</strong> Thank you for
                  your kind understanding.
                </p>
                <div className="mt-[22px] font-vibes text-[46px] not-italic leading-[1.1] text-mist">{coupleNames}</div>
                <div className="mt-2 font-lato text-xs not-italic uppercase tracking-[0.35em] text-white">{dateLabel.replace(',', ' ·')}</div>
              </div>
            </div>
          ) : (
            <div className="text-center" aria-live="polite">
              <div className="mx-auto mb-[18px] mt-1 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-mist bg-[rgba(28,45,64,0.18)] text-mist">
                <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden>
                  <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center text-[11px] uppercase tracking-[0.3em] text-mist">
                {done.previous ? 'We already have your RSVP' : 'Your RSVP has been received'}
              </div>
              <h3 className="my-3 font-serif text-[34px] font-normal text-white">
                {done.response === 'yes'
                  ? `See you there, ${first}!`
                  : done.response === 'proxy'
                    ? `Thank you, ${first}`
                    : `You will be missed, ${first}`}
              </h3>
              <div className="mx-auto mb-[30px] mt-[22px] h-px w-[60px] bg-mist" />
              <p className="m-0 text-base leading-relaxed">
                {done.response === 'yes'
                  ? `We're overjoyed you'll celebrate with us, and your seat${done.total > 1 ? 's have' : ' has'} been reserved.`
                  : done.response === 'proxy'
                    ? `We'll miss you, and we look forward to welcoming ${done.proxyName} in your place.`
                    : "Thank you for letting us know. We'll be thinking of you on our special day."}
              </p>
              <div className="mb-2 mt-[26px] rounded border border-[rgba(220,231,240,0.6)] bg-[rgba(28,45,64,0.15)] px-[18px] py-1.5 text-left">
                {[
                  ['Guest', done.name],
                  ['Response', RESPONSE_LABEL[done.response]],
                  ...(done.response === 'proxy' ? [['Attending for you', done.proxyName ?? '']] : []),
                  ...(done.response !== 'no'
                    ? [
                        ['Companions', done.companions.length ? done.companions.join(', ') : 'None'],
                        ['Seats confirmed', String(done.total)],
                      ]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-white/15 py-[11px] text-sm last:border-b-0">
                    <span className="whitespace-nowrap pt-0.5 text-[11px] uppercase tracking-[0.15em] text-mist">{k}</span>
                    <strong className="text-right font-normal text-white">{v}</strong>
                  </div>
                ))}
              </div>
              {done.response === 'yes' && (
                <p className="mb-0 mt-[26px] font-serif text-[21px] italic leading-normal">
                  We look forward to celebrating with you on
                  <br />
                  <b className="font-lato text-[15px] font-bold not-italic uppercase tracking-[0.25em] text-mist">{dateLabel}</b>
                </p>
              )}
              <div className="mt-[22px] font-vibes text-[46px] leading-[1.1] text-mist">{coupleNames}</div>
              <p className="mt-[26px] text-[13px] leading-relaxed text-white/80">
                Need to change something? Please message {coupleNames} directly.
                <br />
                <button type="button" onClick={resetSearch} className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-mist underline">
                  RSVP for another guest
                </button>
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/** Bolds the part of each word that matches what the guest typed. */
function Highlighted({ name, query }: { name: string; query: string }) {
  const tokens = normName(query).split(' ').filter(Boolean);
  return (
    <>
      {name.split(' ').map((word, i) => {
        const w = normName(word);
        const match = tokens.filter((t) => w.startsWith(t)).sort((a, b) => b.length - a.length)[0];
        return (
          <span key={i}>
            {match ? (
              <>
                <b className="font-bold">{word.slice(0, match.length)}</b>
                {word.slice(match.length)}
              </>
            ) : (
              word
            )}{' '}
          </span>
        );
      })}
    </>
  );
}
