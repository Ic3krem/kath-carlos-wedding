'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';
import { Reveal } from './Reveal';

const UNITS: { key: keyof Omit<CountdownParts, 'isPast'>; label: string }[] = [
  { key: 'months', label: 'Months' },
  { key: 'weeks', label: 'Weeks' },
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
];

export function Countdown({ weddingDate, message }: { weddingDate: string; message: string }) {
  // Null until mounted, so the server and first client render agree.
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const target = new Date(weddingDate);
    const tick = () => setParts(getCountdownParts(target));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section className="bg-mist px-6 py-[72px]">
      <Reveal className="mx-auto flex max-w-[880px] flex-col items-center gap-[22px] text-center">
        {message && <p className="m-0 max-w-[700px] text-[15px] leading-relaxed text-body">{message}</p>}
        <h2 className="m-0 text-[clamp(28px,3.4vw,38px)] font-normal italic text-ink">Days before we say I do</h2>
        <div className="grid w-full max-w-[720px] grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-3.5">
          {UNITS.map((unit) => (
            <div key={unit.key} className="rounded-[10px] border border-line bg-white px-2 pb-3 pt-4 shadow-soft">
              <div className="text-[clamp(30px,4vw,42px)] font-medium leading-none tabular-nums text-ink">
                {String(parts?.[unit.key] ?? 0).padStart(2, '0')}
              </div>
              <div className="mt-2 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">{unit.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
