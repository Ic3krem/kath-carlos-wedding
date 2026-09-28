'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { isSlowNet, useLite, whenIdle } from '@/lib/perf';

// Both are code-split so their JavaScript is only fetched when used.
const MagicOverlay = dynamic(() => import('./MagicOverlay').then((m) => m.MagicOverlay), { ssr: false });
const Florals = dynamic(() => import('./Florals').then((m) => m.Florals), { ssr: false });

/**
 * The decorative layers that aren't needed for the first paint:
 * - side florals: loaded once the page has finished loading (they start
 *   off-screen at the cover anyway); fewer images on slow connections
 * - canvas sparkles/butterflies/petals: skipped entirely in lite mode
 */
export function AmbientEffects() {
  const lite = useLite();
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const slowNet = isSlowNet();
    setSlow(slowNet);
    let alive = true;
    if (!slowNet) {
      whenIdle().then(() => alive && setReady(true));
      return () => {
        alive = false;
      };
    }
    // Slow connection: the flowers are off-screen at the cover, so don't spend
    // bandwidth on them until the guest starts scrolling.
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.25) return;
      window.removeEventListener('scroll', onScroll);
      setReady(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {lite === false && <MagicOverlay />}
      {ready && <Florals sparse={slow} />}
    </>
  );
}
