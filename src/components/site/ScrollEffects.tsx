'use client';

import { useEffect, useRef } from 'react';

/**
 * Page-wide scroll effects in one listener:
 * - the thin progress bar across the top
 * - `[data-parallax]` elements drifting at their own speed (value = speed,
 *   e.g. 0.3 moves 30% of the scroll distance)
 */
export function ScrollEffects() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layers = reduced
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => ({
          el,
          speed: Number(el.dataset.parallax) || 0.2,
          box: el.parentElement ?? el,
        }));
    let frame = 0;

    function update() {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (reduced) return;

      const vh = window.innerHeight;
      // Read every rect first, then write, so the browser lays out once.
      const rects = layers.map((l) => l.box.getBoundingClientRect());
      layers.forEach((l, i) => {
        const rect = rects[i];
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        // 0 when the section's centre is at the viewport's centre.
        const offset = rect.top + rect.height / 2 - vh / 2;
        l.el.style.transform = `translate3d(0, ${(-offset * l.speed).toFixed(1)}px, 0)`;
      });
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-dusty via-steel to-[#f3e3b5]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
