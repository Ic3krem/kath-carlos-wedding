'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [revealed, setRevealed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  // Stay hidden until the block is scrolled into view.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="flex w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black sm:gap-5"
      style={{ fontFamily: poppins.style.fontFamily }}
    >
      <div
        ref={sentinel}
        className={`flex w-full flex-col items-center gap-4 px-4 pt-28 transition-all duration-700 ease-out sm:gap-5 sm:pt-36 lg:pt-44 ${
          revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-white sm:text-2xl md:text-3xl lg:text-[40px]">
          {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
        </h2>

        {!parts.isPast && (
          <div className="grid w-full max-w-5xl grid-cols-3 justify-items-center gap-x-2 gap-y-4 sm:grid-cols-6 sm:gap-x-4">
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
      </div>

      {/* Transition into the content sections below */}
      <div
        className="h-24 w-full sm:h-32 lg:h-40"
        style={{ background: 'linear-gradient(180deg, #000000 0%, var(--color-secondary) 100%)' }}
      />
    </section>
  );
}
