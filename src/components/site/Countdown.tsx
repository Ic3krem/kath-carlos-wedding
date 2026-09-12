'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';

const UNITS: (keyof Omit<CountdownParts, 'isPast'>)[] = ['months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate);
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section className="flex w-full flex-col items-center gap-5 bg-black py-10 text-white">
      <h2 className="font-metropolis text-2xl font-semibold uppercase tracking-wide sm:text-3xl lg:text-4xl">
        {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
      </h2>
      {!parts.isPast && (
        <div className="grid w-full max-w-4xl grid-cols-3 gap-4 px-4 text-center sm:grid-cols-6">
          {UNITS.map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="font-metropolis text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                {String(parts[unit]).padStart(2, '0')}
              </span>
              <span className="font-metropolis text-xs font-semibold capitalize text-white/70 sm:text-sm lg:text-base">{unit}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
