'use client';

import { useEffect, useRef } from 'react';
import { isLite } from '@/lib/perf';

/**
 * Real flower photographs (cut out and colour-graded to the dusty-blue
 * palette, see public/florals/credits.txt) framing both edges of the page.
 *
 * Wrapper layers per flower (outer → inner):
 *   position → lean (scroll/mouse wind)
 *            → near (opens up when the cursor is close)
 *            → bloom (entrance)
 *            → sway (idle wind)
 *            → img (breathing)
 * Only transforms animate, so it all stays on the compositor.
 */

type Flower =
  | 'hydrangea1'
  | 'hydrangea2'
  | 'hydrangea3'
  | 'hydrangea-white'
  | 'rose-blue'
  | 'rose-white'
  | 'rose-open'
  | 'peony-white'
  | 'peony-cream'
  | 'anemone-navy'
  | 'anemone-white'
  | 'lisianthus'
  | 'dahlia'
  | 'plumbago'
  | 'cornflower'
  | 'babys-breath'
  | 'eucalyptus';

interface Item {
  src: Flower;
  /** Left edge, % of the column width (negative bleeds off-screen). */
  x: number;
  /** Top edge, vh. */
  y: number;
  /** Width, % of the column width. */
  size: number;
  rot: number;
  z: number;
  /** Shown on phones too (most are desktop-only so text stays readable). */
  mobile: boolean;
  delay: number;
  amp: number;
  period: number;
  lean: number;
}

type Row = [Flower, number, number, number, number, number, 0 | 1];

/**
 * [flower, x, y, size, rotation, stacking, show on phones]. Motion follows
 * size: big heads sway slowly and a little, small sprigs flutter more. They
 * bloom top to bottom, like the garland unfurling.
 */
function garland(rows: Row[]): Item[] {
  return rows.map(([src, x, y, size, rot, z, mobile], i) => ({
    src,
    x,
    y,
    size,
    rot,
    z,
    mobile: mobile === 1,
    // Scroll progress (0..1) at which this flower starts sliding in.
    delay: Math.min(0.78, 0.04 + ((y + 10) / 110) * 0.66 + ((i * 7) % 5) * 0.012),
    amp: size > 80 ? 1.5 : size > 55 ? 2.5 : 4,
    period: (size > 80 ? 8 : size > 55 ? 6.4 : 5) + (i % 3) * 0.35,
    lean: size > 80 ? 0.7 : size > 55 ? 1 : 1.5,
  }));
}

const LEFT = garland([
  ['eucalyptus', -14, -9, 78, 25, 1, 1],
  ['hydrangea1', -42, -3, 108, -6, 2, 1],
  ['babys-breath', 30, -2, 55, 20, 1, 0],
  ['rose-white', 22, 8, 58, 14, 5, 1],
  ['anemone-navy', 38, 18, 46, -10, 4, 0],
  ['hydrangea-white', -40, 17, 86, 8, 2, 0],
  ['plumbago', 8, 26, 40, -18, 5, 0],
  ['hydrangea2', -44, 30, 92, 10, 2, 0],
  ['peony-cream', 14, 36, 56, -8, 4, 0],
  ['eucalyptus', -26, 42, 70, 165, 1, 0],
  ['cornflower', 40, 44, 34, 12, 5, 0],
  ['dahlia', -36, 50, 76, 6, 3, 0],
  ['lisianthus', 22, 56, 50, 18, 4, 0],
  ['babys-breath', -20, 60, 58, -160, 1, 0],
  ['rose-blue', -6, 64, 56, -12, 4, 0],
  ['anemone-white', 34, 70, 40, -22, 5, 0],
  ['hydrangea3', -40, 72, 96, -10, 2, 1],
  ['peony-white', 16, 80, 56, -14, 4, 1],
  ['eucalyptus', -18, 84, 70, 150, 1, 0],
  ['rose-open', 30, 90, 40, 10, 4, 0],
  ['plumbago', -12, 91, 42, 24, 5, 1],
]);

// The right edge, a different arrangement so it does not read as a mirror.
const RIGHT = garland([
  ['eucalyptus', -18, -8, 70, 35, 1, 0],
  ['hydrangea2', -38, -5, 104, 8, 2, 1],
  ['rose-blue', 20, 6, 58, -10, 5, 1],
  ['babys-breath', 34, 14, 50, -20, 1, 0],
  ['peony-white', -30, 18, 70, 6, 3, 0],
  ['cornflower', 30, 26, 34, -14, 5, 0],
  ['hydrangea-white', -42, 30, 88, -8, 2, 0],
  ['anemone-navy', 16, 38, 46, 12, 4, 0],
  ['eucalyptus', -24, 44, 72, 160, 1, 0],
  ['dahlia', -36, 48, 74, -6, 3, 0],
  ['rose-white', 20, 54, 52, 18, 4, 0],
  ['lisianthus', -28, 60, 60, -10, 3, 0],
  ['plumbago', 36, 62, 34, -20, 5, 0],
  ['hydrangea1', -44, 66, 92, 6, 2, 0],
  ['babys-breath', 24, 70, 52, 150, 1, 1],
  ['anemone-white', -10, 74, 44, 16, 5, 0],
  ['hydrangea3', -40, 78, 98, 12, 2, 1],
  ['peony-cream', 18, 84, 54, -14, 4, 1],
  ['rose-blue', -14, 90, 50, 10, 5, 1],
  ['cornflower', 34, 92, 32, 20, 5, 0],
]);

/** Petals that come loose and drift down the page. */
const PETALS = [
  { side: 'l', x: 30, delay: 0, dur: 16, drift: 60, size: 16, tone: 'blue' },
  { side: 'l', x: 55, delay: 6, dur: 19, drift: 90, size: 12, tone: 'white' },
  { side: 'l', x: 10, delay: 11, dur: 17, drift: 40, size: 14, tone: 'blue' },
  { side: 'l', x: 70, delay: 3.5, dur: 22, drift: 120, size: 11, tone: 'white' },
  { side: 'l', x: 20, delay: 8.5, dur: 15, drift: 70, size: 15, tone: 'blue' },
  { side: 'l', x: 45, delay: 14, dur: 20, drift: 100, size: 13, tone: 'white' },
  { side: 'r', x: 35, delay: 3, dur: 18, drift: 70, size: 15, tone: 'white' },
  { side: 'r', x: 15, delay: 9, dur: 21, drift: 110, size: 12, tone: 'blue' },
  { side: 'r', x: 60, delay: 14, dur: 16, drift: 50, size: 13, tone: 'white' },
  { side: 'r', x: 25, delay: 1.5, dur: 19, drift: 90, size: 14, tone: 'blue' },
  { side: 'r', x: 50, delay: 7, dur: 23, drift: 130, size: 11, tone: 'white' },
  { side: 'r', x: 8, delay: 12, dur: 17, drift: 60, size: 16, tone: 'blue' },
] as const;

/** `sparse`: slow connection, so only the few flowers phones get (fewer downloads). */
export function Florals({ sparse = false }: { sparse?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const blooms = Array.from(root.querySelectorAll<HTMLElement>('.flora-bloom')).map((el) => ({
      el,
      t: Number(el.dataset.t) || 0,
      v: -1,
    }));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      blooms.forEach((b) => b.el.style.setProperty('--enter', '1'));
      root.style.setProperty('--garland', '1');
      return;
    }

    // Entrance: the sides start empty at the cover and fill in, top to
    // bottom, over the first screen and a half of scrolling. Scrolling back
    // up sends them away again.
    const ENTER_SPAN = 0.2;
    let enterFrame = 0;
    const updateEnter = () => {
      enterFrame = 0;
      const p = Math.min(1, window.scrollY / (window.innerHeight * 1.5));
      root.style.setProperty('--garland', Math.min(1, p * 2.5).toFixed(2));
      for (const b of blooms) {
        const v = Math.max(0, Math.min(1, (p - b.t) / ENTER_SPAN));
        if (Math.abs(v - b.v) > 0.01) {
          if ((v === 0) !== (b.v === 0) || b.v < 0) {
            if (v === 0) b.el.setAttribute('data-off', '');
            else b.el.removeAttribute('data-off');
          }
          b.v = v;
          b.el.style.setProperty('--enter', v.toFixed(3));
        }
      }
    };
    const queueEnter = () => {
      if (!enterFrame) enterFrame = requestAnimationFrame(updateEnter);
    };
    updateEnter();

    const left = root.querySelector<HTMLElement>('[data-side="l"]');
    const right = root.querySelector<HTMLElement>('[data-side="r"]');

    // Wind: scrolling makes the flowers lean with the motion; the mouse near
    // an edge pushes that side's flowers away. Both ease back to rest.
    let lastY = window.scrollY;
    let gust = 0;
    let mouseL = 0;
    let mouseR = 0;
    let frame = 0;
    let running = false;

    const tick = () => {
      gust *= 0.92;
      mouseL *= 0.94;
      mouseR *= 0.94;
      left?.style.setProperty('--lean', (gust + mouseL).toFixed(2));
      right?.style.setProperty('--lean', (gust + mouseR).toFixed(2));
      if (Math.abs(gust) + Math.abs(mouseL) + Math.abs(mouseR) > 0.05) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };
    const kick = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const onScroll = () => {
      queueEnter();
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      gust = Math.max(-10, Math.min(10, gust + dy * 0.05));
      kick();
    };

    // Flowers near the cursor open up a little and catch the light. Their
    // positions are fixed to the viewport, so they are measured once (and on
    // resize) rather than on every move.
    let spots: { el: HTMLElement; x: number; y: number; r: number; near: number }[] = [];
    const measure = () => {
      spots = Array.from(root.querySelectorAll<HTMLElement>('.flora-pos')).flatMap((pos) => {
        const el = pos.querySelector<HTMLElement>('.flora-near');
        const rect = pos.getBoundingClientRect();
        if (!el || rect.width === 0) return [];
        return [{ el, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: Math.max(rect.width, 90), near: 0 }];
      });
    };
    let mx = -9999;
    let my = -9999;
    let nearFrame = 0;
    const updateNear = () => {
      nearFrame = 0;
      for (const spot of spots) {
        const d = Math.hypot(mx - spot.x, my - spot.y);
        const near = Math.max(0, 1 - d / (spot.r * 1.1));
        if (Math.abs(near - spot.near) > 0.02) {
          spot.near = near;
          spot.el.style.setProperty('--near', near.toFixed(2));
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || isLite()) return;
      mx = e.clientX;
      my = e.clientY;
      if (!nearFrame) nearFrame = requestAnimationFrame(updateNear);
      const reach = 280;
      const w = window.innerWidth;
      if (e.clientX < reach) mouseL = Math.max(mouseL, ((reach - e.clientX) / reach) * 8);
      if (e.clientX > w - reach) mouseR = Math.max(mouseR, ((e.clientX - (w - reach)) / reach) * 8);
      kick();
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(nearFrame);
      cancelAnimationFrame(enterFrame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="florals pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <PetalDefs />
      <Column side="l" items={sparse ? LEFT.filter((it) => it.mobile) : LEFT} />
      <Column side="r" items={sparse ? RIGHT.filter((it) => it.mobile) : RIGHT} />
      <div className="flora-petals">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={`flora-petal ${p.side === 'l' ? 'left-0' : 'right-0'}`}
          style={
            {
              '--px': `${p.x}`,
              '--drift': `${p.side === 'l' ? p.drift : -p.drift}px`,
              '--size': `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        >
          <Petal tone={p.tone} />
        </span>
      ))}
      </div>
    </div>
  );
}

function Column({ side, items }: { side: 'l' | 'r'; items: Item[] }) {
  return (
    <div data-side={side} className={`flora-col ${side === 'l' ? 'left-0' : 'right-0 flora-mirror'}`}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`flora-pos ${it.mobile ? '' : 'flora-desktop'}`}
          style={{ left: `${it.x}%`, top: `${it.y}vh`, width: `${it.size}%`, zIndex: it.z }}
        >
          <div className="flora-lean" style={{ '--k': it.lean } as React.CSSProperties}>
            <div className="flora-near">
              <div className="flora-bloom" data-t={it.delay} data-off="">
                <div
                  className="flora-sway"
                  style={
                    {
                      '--amp': `${it.amp}deg`,
                      '--rot': `${it.rot}deg`,
                      animationDuration: `${it.period}s`,
                      animationDelay: `${-((i * 1.37) % it.period)}s`,
                    } as React.CSSProperties
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/florals/${it.src}.webp?v=2`}
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="flora-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PetalDefs() {
  return (
    <svg width="0" height="0" className="absolute" focusable="false">
      <defs>
        <radialGradient id="g-petal" cx="0.5" cy="1" r="1.05">
          <stop offset="0" stopColor="#f3f7fb" />
          <stop offset="0.45" stopColor="#c6d6e4" />
          <stop offset="1" stopColor="#7b98b4" />
        </radialGradient>
        <radialGradient id="g-petal-white" cx="0.5" cy="1" r="1.05">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#c9d8e6" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Petal({ tone }: { tone: 'blue' | 'white' }) {
  return (
    <svg viewBox="-11 -15 22 30" className="h-full w-full">
      <path
        d="M0 13 C -10 4 -8 -9 0 -14 C 8 -9 10 4 0 13 Z"
        fill={tone === 'blue' ? 'url(#g-petal)' : 'url(#g-petal-white)'}
        stroke="#5b7c9c"
        strokeOpacity="0.25"
      />
    </svg>
  );
}
