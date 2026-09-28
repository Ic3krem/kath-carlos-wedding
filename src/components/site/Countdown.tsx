'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';
import { Decor } from './Decor';
import { Reveal } from './Reveal';

type UnitKey = keyof Omit<CountdownParts, 'isPast'> | 'totalDays' | 'dayHours';

// Desktop: the full breakdown. Phones: total days, then hours, minutes and
// seconds (the days keep counting past 7/30, so nothing is lost).
const UNITS: { key: UnitKey; label: string; show: 'all' | 'desktop' | 'phone' }[] = [
  { key: 'months', label: 'Months', show: 'desktop' },
  { key: 'weeks', label: 'Weeks', show: 'desktop' },
  { key: 'days', label: 'Days', show: 'desktop' },
  { key: 'totalDays', label: 'Days', show: 'phone' },
  { key: 'hours', label: 'Hours', show: 'desktop' },
  { key: 'dayHours', label: 'Hours', show: 'phone' },
  { key: 'minutes', label: 'Minutes', show: 'all' },
  { key: 'seconds', label: 'Seconds', show: 'all' },
];

const SHOW_CLASS = { all: '', desktop: 'hidden sm:block', phone: 'sm:hidden' } as const;

export function Countdown({ weddingDate, message }: { weddingDate: string; message: string }) {
  // Null until mounted, so the server and first client render agree.
  const [parts, setParts] = useState<(CountdownParts & { totalDays: number; dayHours: number }) | null>(null);

  useEffect(() => {
    const target = new Date(weddingDate);
    const tick = () => {
      const now = new Date();
      const ms = Math.max(0, target.getTime() - now.getTime());
      setParts({
        ...getCountdownParts(target, now),
        totalDays: Math.floor(ms / 86_400_000),
        dayHours: Math.floor(ms / 3_600_000) % 24,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section className="relative isolate overflow-hidden bg-mist px-6 py-[72px]">
      <Decor tone="mist" />
      <Reveal className="mx-auto flex max-w-[880px] flex-col items-center gap-[22px] text-center">
        {message && <p className="m-0 max-w-[700px] text-[15px] leading-relaxed text-body">{message}</p>}
        <h2 className="m-0 text-[clamp(28px,3.4vw,38px)] font-normal italic text-ink">Days before we say I do</h2>
        <div className="grid w-full max-w-[720px] grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3.5">
          {UNITS.map((unit, i) => {
            const n = parts?.[unit.key] ?? 0;
            const value = unit.key === 'totalDays' ? n.toLocaleString('en-US').padStart(2, '0') : String(n).padStart(2, '0');
            return (
              <Reveal key={unit.key} from="scale" delay={200 + i * 90} className={SHOW_CLASS[unit.show]}>
                <div className="lift rounded-[10px] border border-line bg-white px-1 pb-3 pt-4 shadow-soft sm:px-2">
                  <div className="text-[clamp(28px,4vw,42px)] font-medium leading-none tabular-nums text-ink [perspective:400px]">
                    <span key={value} className="tick">
                      {value}
                    </span>
                  </div>
                  <div className="mt-2 font-sans text-[9px] uppercase tracking-[0.14em] text-muted sm:text-[10px] sm:tracking-[0.2em]">{unit.label}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
