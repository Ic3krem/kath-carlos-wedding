'use client';

import { useEffect, useRef } from 'react';
import { formatLongDate, formatTime, formatWeekday } from '@/lib/date-utils';
import type { Settings } from '@/lib/types';

export function Hero({ settings }: { settings: Settings }) {
  const image = settings.hero_image_url || '/hero/hero.webp';
  const sectionRef = useRef<HTMLElement>(null);

  // The photo leans away from the mouse and sinks as the page scrolls, so the
  // text appears to float in front of it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      frame = 0;
      const scroll = Math.min(window.scrollY, window.innerHeight);
      section.style.setProperty('--hero-scroll', `${scroll}px`);
      section.style.setProperty('--hero-fade', `${Math.max(0, 1 - scroll / 650)}`);
      section.style.setProperty('--hero-mx', `${mx}`);
      section.style.setProperty('--hero-my', `${my}`);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      queue();
    };

    apply();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="hero relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#3a4a58]"
    >
      <div className="hero-media absolute inset-[-6%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={settings.couple_names} className="hero-kenburns h-full w-full object-cover" fetchPriority="high" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,30,40,0.35),rgba(20,30,40,0.5))]" />
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <div className="hero-content relative flex flex-col items-center gap-3.5 p-6 text-center text-white">
        <div className="hero-in font-sans text-xs font-medium uppercase tracking-[0.4em]" style={{ animationDelay: '150ms' }}>
          We are getting married
        </div>
        <h1
          className="hero-in hero-title m-0 text-[clamp(62px,10.5vw,124px)] font-normal leading-[1.05] [word-spacing:0.18em]"
          style={{ animationDelay: '350ms' }}
        >
          {settings.couple_names}
        </h1>
        <div className="hero-in font-script text-[clamp(34px,4.4vw,50px)] leading-[1.2]" style={{ animationDelay: '650ms' }}>
          {formatLongDate(settings.wedding_date)}
        </div>
        <div
          className="hero-in font-sans text-[clamp(13px,1.6vw,17px)] font-medium uppercase tracking-[0.35em]"
          style={{ animationDelay: '850ms' }}
        >
          {formatWeekday(settings.wedding_date)} · {formatTime(settings.wedding_date)}
        </div>
        <a
          href="#rsvp"
          className="hero-in btn-shine mt-[18px] rounded-full bg-white px-9 py-3 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-ink no-underline shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-haze hover:shadow-[0_10px_28px_rgba(0,0,0,0.3)]"
          style={{ animationDelay: '1050ms' }}
        >
          RSVP
        </a>
      </div>

      <a
        href="#story"
        aria-label="Scroll to our story"
        className="hero-in absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-sans text-[10px] uppercase tracking-[0.35em] text-white/80 no-underline"
        style={{ animationDelay: '1400ms' }}
      >
        Scroll
        <span className="scroll-hint block h-10 w-px bg-white/70" />
      </a>
    </section>
  );
}
