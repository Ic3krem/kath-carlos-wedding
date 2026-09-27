'use client';

import { useEffect, useRef } from 'react';

/**
 * Watercolour dusty-blue florals framing the page edges.
 *
 * Plain SVG (no WebGL) so it costs a few KB. Each flower is its own small
 * <svg> inside HTML wrappers: the watercolour filter is rasterised once and
 * the animations only move composited layers.
 *
 * Wrapper layers per flower (outer → inner):
 *   position  → lean (scroll/mouse wind, JS-driven CSS var)
 *             → bloom (entrance, `scale`)
 *             → sway (idle wind, `rotate`)
 *             → svg (breathing, `scale`)
 */

type Kind = 'rose' | 'anemone' | 'hydrangea' | 'bud' | 'eucalyptus' | 'leaf' | 'breath';

interface Item {
  kind: Kind;
  /** Left edge, % of the column width (can be negative to bleed off-screen). */
  x: number;
  /** Top edge, in vh. */
  y: number;
  /** Width, % of the column width. */
  size: number;
  rot: number;
  /** Bloom-in delay, ms. */
  delay: number;
  /** Sway amplitude (deg) and period (s). */
  amp: number;
  period: number;
  /** How strongly it leans in the wind. */
  lean: number;
  /** Hidden on small screens so text stays readable. */
  desktopOnly?: boolean;
}

const LEFT: Item[] = [
  // top cluster
  { kind: 'eucalyptus', x: -18, y: -4, size: 105, rot: 18, delay: 0, amp: 3, period: 7, lean: 1.2 },
  { kind: 'leaf', x: 38, y: 3, size: 42, rot: 38, delay: 150, amp: 5, period: 5.5, lean: 1.4 },
  { kind: 'hydrangea', x: -22, y: 9, size: 78, rot: -8, delay: 250, amp: 2, period: 8, lean: 0.8 },
  { kind: 'rose', x: 8, y: 1, size: 68, rot: 12, delay: 400, amp: 2.5, period: 6.5, lean: 1 },
  { kind: 'anemone', x: 42, y: 13, size: 52, rot: -14, delay: 600, amp: 4, period: 5, lean: 1.3, desktopOnly: true },
  { kind: 'bud', x: 58, y: 24, size: 24, rot: 28, delay: 800, amp: 7, period: 4.2, lean: 1.8, desktopOnly: true },
  { kind: 'breath', x: 30, y: 22, size: 36, rot: 10, delay: 900, amp: 6, period: 4.8, lean: 1.6, desktopOnly: true },
  // a lone bud midway down
  { kind: 'bud', x: -12, y: 52, size: 26, rot: 70, delay: 1100, amp: 6, period: 4.6, lean: 1.8, desktopOnly: true },
  // bottom cluster
  { kind: 'leaf', x: 26, y: 76, size: 40, rot: -40, delay: 500, amp: 5, period: 6, lean: 1.4, desktopOnly: true },
  { kind: 'hydrangea', x: -26, y: 80, size: 82, rot: 6, delay: 300, amp: 2, period: 8.5, lean: 0.8, desktopOnly: true },
  { kind: 'anemone', x: 22, y: 86, size: 58, rot: 16, delay: 700, amp: 3.5, period: 5.4, lean: 1.2, desktopOnly: true },
  { kind: 'eucalyptus', x: -30, y: 70, size: 90, rot: 160, delay: 200, amp: 3, period: 7.5, lean: 1.1, desktopOnly: true },
];

const RIGHT: Item[] = [
  // top cluster (mirrored column, so x still counts from the screen edge)
  { kind: 'leaf', x: 30, y: -2, size: 46, rot: 30, delay: 200, amp: 5, period: 6, lean: 1.4, desktopOnly: true },
  { kind: 'eucalyptus', x: -10, y: -6, size: 95, rot: 30, delay: 100, amp: 3, period: 7.2, lean: 1.1, desktopOnly: true },
  { kind: 'anemone', x: -8, y: 6, size: 64, rot: 8, delay: 450, amp: 3, period: 5.8, lean: 1.1, desktopOnly: true },
  { kind: 'bud', x: 46, y: 16, size: 24, rot: 24, delay: 800, amp: 7, period: 4.4, lean: 1.8, desktopOnly: true },
  // bottom cluster
  { kind: 'eucalyptus', x: -24, y: 66, size: 100, rot: 150, delay: 0, amp: 3, period: 7, lean: 1.2 },
  { kind: 'leaf', x: 36, y: 74, size: 40, rot: -32, delay: 350, amp: 5, period: 5.6, lean: 1.5 },
  { kind: 'rose', x: 6, y: 80, size: 66, rot: -10, delay: 500, amp: 2.5, period: 6.8, lean: 1 },
  { kind: 'hydrangea', x: -28, y: 86, size: 76, rot: 10, delay: 250, amp: 2, period: 8, lean: 0.8 },
  { kind: 'breath', x: 44, y: 70, size: 34, rot: -12, delay: 900, amp: 6, period: 5, lean: 1.6, desktopOnly: true },
  { kind: 'anemone', x: 40, y: 89, size: 46, rot: -20, delay: 700, amp: 4, period: 5.2, lean: 1.3 },
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
      const reach = 260;
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
      <WatercolorDefs />
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
          style={{ left: `${it.x}%`, top: `${it.y}vh`, width: `${it.size}%` }}
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
                <Flower kind={it.kind} breatheDelay={-(i % 5)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Flower({ kind, breatheDelay }: { kind: Kind; breatheDelay: number }) {
  const common = {
    viewBox: '-60 -60 120 120',
    className: 'flora-svg',
    style: { animationDelay: `${breatheDelay}s` },
  };
  switch (kind) {
    case 'rose':
      return (
        <svg {...common}>
          <Rose />
        </svg>
      );
    case 'anemone':
      return (
        <svg {...common}>
          <Anemone />
        </svg>
      );
    case 'hydrangea':
      return (
        <svg {...common}>
          <Hydrangea />
        </svg>
      );
    case 'bud':
      return (
        <svg {...common}>
          <Bud />
        </svg>
      );
    case 'eucalyptus':
      return (
        <svg {...common}>
          <Eucalyptus />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <Leaf />
        </svg>
      );
    case 'breath':
      return (
        <svg {...common}>
          <BabysBreath />
        </svg>
      );
  }
}

/* ---- Watercolour paint: shared filters and gradients -------------------- */

function WatercolorDefs() {
  return (
    <svg width="0" height="0" className="absolute" focusable="false">
      <defs>
        {/* Wobbly bleeding edges + mottled pigment, like wet paper. */}
        <filter id="wc" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feGaussianBlur in="wobble" stdDeviation="0.55" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.6 1.08" result="grainAlpha" />
          <feComposite in="soft" in2="grainAlpha" operator="in" />
        </filter>

        <radialGradient id="g-petal" cx="0.5" cy="1" r="1.05">
          <stop offset="0" stopColor="#f3f7fb" />
          <stop offset="0.45" stopColor="#c6d6e4" />
          <stop offset="1" stopColor="#7b98b4" />
        </radialGradient>
        <radialGradient id="g-petal-deep" cx="0.5" cy="1" r="1.1">
          <stop offset="0" stopColor="#dbe6ef" />
          <stop offset="0.5" stopColor="#8aa4bb" />
          <stop offset="1" stopColor="#4f6f8f" />
        </radialGradient>
        <radialGradient id="g-rose" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#c9d8e6" />
          <stop offset="0.7" stopColor="#8aa4bb" />
          <stop offset="1" stopColor="#5b7c9c" />
        </radialGradient>
        <radialGradient id="g-rose-in" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#eef4f9" />
          <stop offset="1" stopColor="#9fb6cb" />
        </radialGradient>
        <linearGradient id="g-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9cabf" />
          <stop offset="1" stopColor="#6f8b80" />
        </linearGradient>
        <radialGradient id="g-euc" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#d3dee0" />
          <stop offset="1" stopColor="#8aa3a9" />
        </radialGradient>
        <linearGradient id="g-bud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d8e6" />
          <stop offset="1" stopColor="#4f6f8f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const PETAL = 'M0 0 C -20 -8 -22 -44 0 -52 C 22 -44 20 -8 0 0 Z';

function Anemone() {
  return (
    <g filter="url(#wc)">
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path key={r} d={PETAL} transform={`rotate(${r})`} fill="url(#g-petal)" stroke="#5b7c9c" strokeOpacity="0.35" strokeWidth="1.2" />
      ))}
      {[30, 90, 150, 210, 270, 330].map((r) => (
        <path key={r} d={PETAL} transform={`rotate(${r}) scale(0.62)`} fill="url(#g-petal-deep)" opacity="0.75" />
      ))}
      <circle r="10" fill="#2a3f5c" />
      <circle r="4" cx="-2" cy="-2" fill="#5b7c9c" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 15} cy={Math.sin(a) * 15} r="1.7" fill="#2a3f5c" />;
      })}
    </g>
  );
}

function Rose() {
  return (
    <g filter="url(#wc)">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="0" cy="-22" rx="27" ry="21" transform={`rotate(${r})`} fill="url(#g-rose)" stroke="#4f6f8f" strokeOpacity="0.3" />
      ))}
      {[36, 108, 180, 252, 324].map((r) => (
        <ellipse key={r} cx="0" cy="-12" rx="18" ry="14" transform={`rotate(${r})`} fill="url(#g-rose-in)" stroke="#5b7c9c" strokeOpacity="0.35" />
      ))}
      <circle r="13" fill="#7f9cb8" />
      <path
        d="M-7 3 C -8 -9 9 -10 9 0 C 9 8 -3 9 -4 2 C -4 -3 4 -3 3 1"
        fill="none"
        stroke="#e6eef5"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  );
}

const FLORETS: [number, number, number, string][] = [
  [0, 0, 0, '#c9d8e6'],
  [-17, -8, 20, '#a9bdd0'],
  [16, -10, 45, '#8aa4bb'],
  [-4, -22, 10, '#dbe6ef'],
  [20, 8, 30, '#c9d8e6'],
  [-20, 10, 60, '#8aa4bb'],
  [2, 18, 15, '#a9bdd0'],
  [-30, -4, 35, '#dbe6ef'],
  [30, -2, 5, '#a9bdd0'],
  [-14, 26, 40, '#c9d8e6'],
  [16, 26, 25, '#8aa4bb'],
  [-22, -24, 50, '#a9bdd0'],
  [20, -26, 15, '#c9d8e6'],
];

function Hydrangea() {
  return (
    <g filter="url(#wc)">
      <circle r="42" fill="#5b7c9c" opacity="0.28" />
      {FLORETS.map(([x, y, r, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="5.5" ry="7" transform={`rotate(${a})`} fill={c} stroke="#4f6f8f" strokeOpacity="0.3" strokeWidth="0.8" />
          ))}
          <circle r="1.8" fill="#2a3f5c" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function Bud() {
  return (
    <g filter="url(#wc)">
      <path d="M0 58 C 2 40 0 30 0 22" stroke="#6f8b80" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M0 26 C -26 10 -18 -34 0 -50 C 18 -34 26 10 0 26 Z" fill="url(#g-bud)" stroke="#2f465d" strokeOpacity="0.3" />
      <path d="M0 26 C -16 22 -24 6 -20 -6 C -10 4 -4 14 0 26 Z" fill="url(#g-leaf)" />
      <path d="M0 26 C 16 22 24 6 20 -6 C 10 4 4 14 0 26 Z" fill="url(#g-leaf)" />
    </g>
  );
}

function Eucalyptus() {
  const leaves: [number, number, number][] = [
    [-44, -46, 8],
    [-30, -34, 10],
    [-36, -22, 9],
    [-16, -16, 11],
    [-22, -2, 10],
    [0, 2, 12],
    [-6, 16, 11],
    [16, 20, 12],
    [10, 34, 10],
    [30, 40, 11],
  ];
  return (
    <g filter="url(#wc)">
      <path d="M-54 -58 C -24 -24 4 8 44 58" stroke="#7d959c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="url(#g-euc)" stroke="#6d868d" strokeOpacity="0.35" />
      ))}
    </g>
  );
}

function Leaf() {
  return (
    <g filter="url(#wc)">
      <path d="M0 54 C -28 22 -22 -30 0 -54 C 22 -30 28 22 0 54 Z" fill="url(#g-leaf)" stroke="#5f7a6f" strokeOpacity="0.3" />
      <path d="M0 50 C 2 20 1 -20 0 -48" stroke="#5f7a6f" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
      {[-26, -8, 10, 28].map((y) => (
        <path key={y} d={`M0 ${y} C 6 ${y - 6} 12 ${y - 8} 16 ${y - 14}`} stroke="#5f7a6f" strokeOpacity="0.35" fill="none" />
      ))}
    </g>
  );
}

function BabysBreath() {
  const heads: [number, number][] = [
    [-26, -30],
    [-8, -42],
    [14, -34],
    [28, -16],
    [-32, -8],
    [6, -18],
    [-14, -20],
  ];
  return (
    <g filter="url(#wc)">
      {heads.map(([x, y], i) => (
        <path key={`s${i}`} d={`M0 56 Q ${x / 2} ${(y + 56) / 2 + 8} ${x} ${y}`} stroke="#8fa69a" strokeWidth="1.2" fill="none" />
      ))}
      {heads.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="5" fill="#f5f9fc" stroke="#8aa4bb" strokeOpacity="0.5" />
          <circle r="4" cx="7" cy="4" fill="#eef4f9" stroke="#8aa4bb" strokeOpacity="0.4" />
          <circle r="3.4" cx="-6" cy="5" fill="#ffffff" stroke="#8aa4bb" strokeOpacity="0.4" />
        </g>
      ))}
    </g>
  );
}

function Petal() {
  return (
    <svg viewBox="-11 -15 22 30" className="h-full w-full">
      <path d="M0 13 C -10 4 -8 -9 0 -14 C 8 -9 10 4 0 13 Z" fill="url(#g-petal)" stroke="#5b7c9c" strokeOpacity="0.35" filter="url(#wc)" />
    </svg>
  );
}
