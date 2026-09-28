'use client';

import { useEffect } from 'react';
import { enableLite, isLite, whenIdle } from '@/lib/perf';

/**
 * 1. Watches real frame times for a couple of seconds once the page has
 *    settled; if the device is struggling, turns on lite mode.
 * 2. Registers the service worker that caches the site for repeat visits.
 */
export function PerfGuard() {
  useEffect(() => {
    let cancelled = false;

    const probe = () => {
      if (cancelled || isLite() || document.hidden) return;
      const times: number[] = [];
      let last = performance.now();
      const step = (t: number) => {
        if (cancelled) return;
        times.push(t - last);
        last = t;
        if (times.length < 120) {
          requestAnimationFrame(step);
          return;
        }
        const sorted = [...times].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const slowFrames = times.filter((d) => d > 50).length / times.length;
        // Under ~30fps typical, or a quarter of frames badly late.
        if (median > 33 || slowFrames > 0.25) enableLite();
      };
      requestAnimationFrame(step);
    };

    // Measure after the intro has finished, when the full page is running.
    const introPending = !!document.querySelector('.floral-intro') && !document.documentElement.classList.contains('intro-seen');
    const start = () => whenIdle().then(() => setTimeout(probe, 1500));
    if (introPending) window.addEventListener('intro-done', start, { once: true });
    else start();

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      whenIdle().then(() => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
    }

    return () => {
      cancelled = true;
      window.removeEventListener('intro-done', start);
    };
  }, []);

  return null;
}
