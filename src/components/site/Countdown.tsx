'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';
import { poppins } from '@/lib/fonts';

const UNITS: { key: keyof Omit<CountdownParts, 'isPast'>; label: string }[] = [
  { key: 'months', label: 'Months' },
  { key: 'weeks', label: 'Weeks' },
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
];

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate);
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section
      className="flex w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black sm:gap-5"
      style={{ fontFamily: poppins.style.fontFamily }}
    >
      <div className="flex w-full items-center justify-center px-4 pt-16 sm:pt-20 lg:pt-24">
        <h2 className="text-center text-xl font-semibold uppercase text-white sm:text-2xl md:text-3xl lg:text-[40px]">
          {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
        </h2>
      </div>

      {!parts.isPast && (
        <div className="grid w-full max-w-5xl grid-cols-3 justify-items-center gap-x-2 gap-y-4 px-4 pb-16 sm:grid-cols-6 sm:gap-x-4 sm:pb-20 lg:pb-28">
          {UNITS.map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center justify-center py-2 sm:py-5">
              <div className="text-center text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[48px]">
                {String(parts[key]).padStart(2, '0')}
              </div>
              <div className="text-center text-xs font-semibold text-white sm:text-sm lg:text-base">{label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
