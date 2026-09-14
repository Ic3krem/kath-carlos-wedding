'use client';

import { useEffect, useRef, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';
import { poppins } from '@/lib/fonts';

// Hours, minutes and seconds are hidden on narrow screens — six units squeeze
// into an unreadable two-row grid there, so small widths show the three that
// actually matter at a glance.
const UNITS: { key: keyof Omit<CountdownParts, 'isPast'>; label: string; smallScreen: boolean }[] = [
  { key: 'months', label: 'Months', smallScreen: true },
  { key: 'weeks', label: 'Weeks', smallScreen: true },
  { key: 'days', label: 'Days', smallScreen: true },
  { key: 'hours', label: 'Hours', smallScreen: false },
  { key: 'minutes', label: 'Minutes', smallScreen: false },
  { key: 'seconds', label: 'Seconds', smallScreen: false },
];

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate);
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));
  const [revealed, setRevealed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    function start() { interval = setInterval(() => setParts(getCountdownParts(target)), 1000); }
    function onVisibility() {
      clearInterval(interval);
      if (!document.hidden) { setParts(getCountdownParts(target)); start(); }
    }
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisibility); };
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
      // Solid black panel, one full viewport tall so that once it pins (see
      // page.tsx) the countdown sits dead centre of the screen. svh keeps it
      // honest on mobile, where the browser chrome collapses on scroll.
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black px-4 py-16 sm:gap-5"
      style={{ fontFamily: poppins.style.fontFamily }}
    >
      <div
        ref={sentinel}
        className={`flex w-full flex-col items-center gap-6 transition-[transform,opacity] duration-700 ease-out sm:gap-8 ${
          revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-white sm:text-2xl md:text-3xl lg:text-[40px]">
          {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
        </h2>

        {!parts.isPast && (
          <div className="grid w-full max-w-5xl grid-cols-3 justify-items-center gap-x-2 gap-y-4 sm:grid-cols-6 sm:gap-x-4">
            {UNITS.map(({ key, label, smallScreen }, index) => (
              <div
                key={key}
                style={{ transitionDelay: `${120 + index * 90}ms` }}
                className={`flex-col items-center justify-center py-2 transition-[transform,opacity] duration-700 ease-out sm:flex sm:py-5 ${
                  smallScreen ? 'flex' : 'hidden'
                } ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <div className="text-center text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[48px]">
                  {String(parts[key]).padStart(2, '0')}
                </div>
                <div className="text-center text-xs font-semibold text-white sm:text-sm lg:text-base">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
