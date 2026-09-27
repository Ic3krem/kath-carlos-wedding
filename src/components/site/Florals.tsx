'use client';

import { useEffect, useRef } from 'react';

/**
 * Real flower photographs (cut out and colour-graded to the dusty-blue
 * palette, see public/florals/CREDITS.md) framing both edges of the page.
 *
 * Wrapper layers per flower (outer → inner):
 *   position → lean (scroll/mouse wind, JS-driven CSS var)
 *            → bloom (entrance, `scale`)
 *            → sway (idle wind, `rotate`)
 *            → img (breathing, `scale`)
 * Only transforms animate, so it all stays on the compositor.
 */

type Flower =
  | 'hydrangea1'
  | 'hydrangea2'
  | 'hydrangea3'
  | 'rose-blue'
  | 'rose-white'
  | 'rose-open'
  | 'dahlia'
  | 'plumbago'
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
  delay: number;
  amp: number;
  period: number;
  lean: number;
  /** Stacking within the column. */
  z?: number;
  /** Hidden on phones so the text stays readable. */
  desktopOnly?: boolean;
}

// A garland down the whole left edge.
const LEFT: Item[] = [
  { src: 'eucalyptus', x: -12, y: -8, size: 80, rot: 25, delay: 0, amp: 3, period: 7, lean: 1.3, z: 1 },
  { src: 'hydrangea1', x: -40, y: -2, size: 110, rot: -6, delay: 150, amp: 1.5, period: 8, lean: 0.7, z: 2 },
  { src: 'rose-white', x: 22, y: 9, size: 60, rot: 14, delay: 350, amp: 2.5, period: 6.4, lean: 1, z: 4 },
  { src: 'plumbago', x: 40, y: 22, size: 38, rot: -18, delay: 550, amp: 4, period: 5, lean: 1.5, z: 3, desktopOnly: true },
  { src: 'hydrangea2', x: -42, y: 24, size: 92, rot: 10, delay: 250, amp: 1.5, period: 8.5, lean: 0.7, z: 2, desktopOnly: true },
  { src: 'rose-blue', x: 4, y: 37, size: 60, rot: -12, delay: 450, amp: 2.2, period: 6.8, lean: 1, z: 3, desktopOnly: true },
  { src: 'eucalyptus', x: -30, y: 44, size: 72, rot: 160, delay: 300, amp: 3, period: 7.4, lean: 1.3, z: 1, desktopOnly: true },
  { src: 'dahlia', x: -34, y: 52, size: 74, rot: 8, delay: 600, amp: 2, period: 7.6, lean: 0.8, z: 3, desktopOnly: true },
  { src: 'rose-open', x: 26, y: 61, size: 52, rot: 20, delay: 700, amp: 3, period: 5.8, lean: 1.2, z: 4, desktopOnly: true },
  { src: 'hydrangea3', x: -38, y: 70, size: 96, rot: -10, delay: 200, amp: 1.5, period: 8.2, lean: 0.7, z: 2 },
  { src: 'rose-white', x: 20, y: 81, size: 56, rot: -16, delay: 500, amp: 2.5, period: 6.2, lean: 1, z: 4 },
  { src: 'plumbago', x: -18, y: 90, size: 44, rot: 24, delay: 800, amp: 4, period: 5.2, lean: 1.5, z: 5 },
];

// The right edge, a different arrangement so it does not read as a mirror.
const RIGHT: Item[] = [
  { src: 'hydrangea2', x: -38, y: -4, size: 104, rot: 8, delay: 100, amp: 1.5, period: 8.4, lean: 0.7, z: 2 },
  { src: 'rose-blue', x: 20, y: 7, size: 58, rot: -10, delay: 350, amp: 2.4, period: 6.6, lean: 1, z: 4 },
  { src: 'eucalyptus', x: -20, y: 14, size: 74, rot: 35, delay: 0, amp: 3, period: 7.2, lean: 1.3, z: 1, desktopOnly: true },
  { src: 'rose-open', x: 36, y: 24, size: 44, rot: 12, delay: 600, amp: 3, period: 5.6, lean: 1.3, z: 3, desktopOnly: true },
  { src: 'dahlia', x: -36, y: 30, size: 78, rot: -8, delay: 400, amp: 2, period: 7.8, lean: 0.8, z: 3, desktopOnly: true },
  { src: 'hydrangea1', x: -44, y: 45, size: 96, rot: 6, delay: 250, amp: 1.5, period: 8.6, lean: 0.7, z: 2, desktopOnly: true },
  { src: 'rose-white', x: 16, y: 53, size: 54, rot: 18, delay: 700, amp: 2.6, period: 6, lean: 1.1, z: 4, desktopOnly: true },
  { src: 'plumbago', x: 38, y: 64, size: 36, rot: -20, delay: 900, amp: 4, period: 5, lean: 1.6, z: 5, desktopOnly: true },
  { src: 'eucalyptus', x: -24, y: 66, size: 78, rot: 150, delay: 150, amp: 3, period: 7, lean: 1.3, z: 1 },
  { src: 'hydrangea3', x: -40, y: 76, size: 98, rot: 12, delay: 300, amp: 1.5, period: 8, lean: 0.7, z: 2 },
  { src: 'rose-blue', x: 22, y: 86, size: 54, rot: -14, delay: 550, amp: 2.4, period: 6.4, lean: 1, z: 4 },
];

/** Petals that come loose and drift down the page. */
const PETALS = [
  { side: 'l', x: 30, delay: 0, dur: 16, drift: 60, size: 16 },
  { side: 'l', x: 55, delay: 6, dur: 19, drift: 90, size: 12 },
  { side: 'l', x: 10, delay: 11, dur: 17, drift: 40, size: 14 },
  { side: 'r', x: 35, delay: 3, dur: 18, drift: 70, size: 15 },
  { side: 'r', x: 15, delay: 9, dur: 21, drift: 110, size: 12 },
  { side: 'r', x: 60, delay: 14, dur: 16, drift: 50, size: 13 },
] as const;

export function Florals() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Wind: scrolling makes the flowers lean with the motion; the mouse near an
  // edge pushes that side's flowers away. Both ease back to rest.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const left = root.querySelector<HTMLElement>('[data-side="l"]');
    const right = root.querySelector<HTMLElement>('[data-side="r"]');
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
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      gust = Math.max(-10, Math.min(10, gust + dy * 0.05));
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const reach = 280;
      const w = window.innerWidth;
      if (e.clientX < reach) mouseL = Math.max(mouseL, ((reach - e.clientX) / reach) * 8);
      if (e.clientX > w - reach) mouseR = Math.max(mouseR, ((e.clientX - (w - reach)) / reach) * 8);
      kick();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="florals pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <PetalDefs />
      <Column side="l" items={LEFT} />
      <Column side="r" items={RIGHT} />
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
          <Petal />
        </span>
      ))}
    </div>
  );
}

function Column({ side, items }: { side: 'l' | 'r'; items: Item[] }) {
  return (
    <div data-side={side} className={`flora-col ${side === 'l' ? 'left-0' : 'right-0 flora-mirror'}`}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`flora-pos ${it.desktopOnly ? 'flora-desktop' : ''}`}
          style={{ left: `${it.x}%`, top: `${it.y}vh`, width: `${it.size}%`, zIndex: it.z }}
        >
          <div className="flora-lean" style={{ '--k': it.lean } as React.CSSProperties}>
            <div className="flora-bloom" style={{ animationDelay: `${it.delay}ms` }}>
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
                  src={`/florals/${it.src}.webp`}
                  alt=""
                  draggable={false}
                  decoding="async"
                  className="flora-img"
                  style={{ animationDelay: `${-(i % 5)}s` }}
                />
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
      </defs>
    </svg>
  );
}

function Petal() {
  return (
    <svg viewBox="-11 -15 22 30" className="h-full w-full">
      <path d="M0 13 C -10 4 -8 -9 0 -14 C 8 -9 10 4 0 13 Z" fill="url(#g-petal)" stroke="#5b7c9c" strokeOpacity="0.3" />
    </svg>
  );
}
