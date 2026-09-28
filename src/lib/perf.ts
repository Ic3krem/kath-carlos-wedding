'use client';

import { useEffect, useState } from 'react';

/*
 * Lite mode: devices or connections that can't comfortably run the live
 * effects get a still version of the page. The inline script in the layout
 * decides before first paint (saved choice, data saver, slow network, little
 * memory/cores, reduced motion); PerfGuard can switch it on later if frames
 * are dropping. Classes on <html>:
 *   lite      heavy effects off (canvas, orbs, petals, sway, tilt)
 *   slow-net  also skip the intro and load fewer flower images
 */

export const LITE_EVENT = 'perf-lite';

export function isLite(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('lite');
}

export function isSlowNet(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('slow-net');
}

/** Switches the page to lite mode for this and future visits. */
export function enableLite() {
  if (isLite()) return;
  document.documentElement.classList.add('lite');
  try {
    localStorage.setItem('perf-mode', 'lite');
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(LITE_EVENT));
}

/** `null` until mounted, then whether lite mode is on (updates live). */
export function useLite(): boolean | null {
  const [lite, setLite] = useState<boolean | null>(null);
  useEffect(() => {
    setLite(isLite());
    const on = () => setLite(true);
    window.addEventListener(LITE_EVENT, on);
    return () => window.removeEventListener(LITE_EVENT, on);
  }, []);
  return lite;
}

/** Resolves once the page has loaded and the browser has a quiet moment. */
export function whenIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () =>
      'requestIdleCallback' in window
        ? (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(
            () => resolve(),
            { timeout: 2500 },
          )
        : setTimeout(resolve, 300);
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });
}
