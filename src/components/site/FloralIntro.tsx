'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Opening curtain: once the flower photos have loaded, the bouquet blooms in
 * slowly; when the guest taps, the flowers part from the centre outward and
 * fly off the edges to reveal the cover photo. It never opens on its own.
 *
 * Rendered on the server so the cover never flashes first. It plays once per
 * browser session: an inline script in the layout marks <html> with
 * `intro-seen` before paint, which hides it via CSS. A CSS fail-safe also
 * hides it after a few seconds if JavaScript never runs.
 */

const FLOWERS = [
  'hydrangea1',
  'hydrangea2',
  'hydrangea3',
  'hydrangea-white',
  'rose-blue',
  'rose-white',
  'rose-open',
  'peony-white',
  'peony-cream',
  'anemone-navy',
  'anemone-white',
  'lisianthus',
  'dahlia',
  'plumbago',
  'cornflower',
  'babys-breath',
  'eucalyptus',
];

/** Deterministic PRNG so the server and client lay the flowers out alike. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Piece {
  src: string;
  x: number;
  y: number;
  size: number;
  rot: number;
  z: number;
  delay: number;
  fx: number;
  fy: number;
  fr: number;
  out: number;
}

function layout(): Piece[] {
  const rand = mulberry32(20261128);
  const cols = 7;
  const rows = 6;
  const pieces: Piece[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) / cols) * 100 + (rand() - 0.5) * 12;
      const y = ((r + 0.5) / rows) * 100 + (rand() - 0.5) * 12;
      const dx = x - 50;
      const dy = y - 50;
      const dist = Math.min(1, Math.hypot(dx, dy) / 70);
      const len = Math.hypot(dx, dy) || 1;
      pieces.push({
        src: FLOWERS[Math.floor(rand() * FLOWERS.length)],
        x,
        y,
        size: 20 + rand() * 14,
        rot: (rand() - 0.5) * 70,
        z: Math.floor(rand() * 10),
        // Centre first, spreading outward, so the bouquet builds up slowly.
        delay: Math.round(dist * 1700 + rand() * 500),
        // Fly straight out from the centre, well past the edge.
        fx: (dx / len) * 95,
        fy: (dy / len) * 95,
        fr: (rand() - 0.5) * 160,
        // Centre flowers leave first, so it opens like a curtain parting.
        out: Math.round(dist * 380),
      });
    }
  }
  // A few extra heads in the middle so the names sit in a nest of petals.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 50 + Math.cos(a) * 16;
    const y = 50 + Math.sin(a) * 18;
    pieces.push({
      src: FLOWERS[Math.floor(rand() * FLOWERS.length)],
      x,
      y,
      size: 16 + rand() * 8,
      rot: (rand() - 0.5) * 60,
      z: 11,
      delay: 900 + i * 160,
      fx: Math.cos(a) * 95,
      fy: Math.sin(a) * 95,
      fr: (rand() - 0.5) * 160,
      out: 0,
    });
  }
  return pieces;
}

const PIECES = layout();

export function FloralIntro({ coupleNames }: { coupleNames: string }) {
  const [phase, setPhase] = useState<'cover' | 'opening' | 'done'>('cover');
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => {
    setPhase((p) => (p === 'cover' ? 'opening' : p));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const seen = document.documentElement.classList.contains('intro-seen');
    if (seen || !root) {
      setPhase('done');
      return;
    }
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* Private mode: it just plays again next time. */
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Start blooming only once the photos are in, so none pop in late.
    const images = Array.from(root.querySelectorAll('img')).filter((img) => img.offsetParent !== null);
    let alive = true;
    Promise.race([
      Promise.all(images.map((img) => img.decode().catch(() => undefined))),
      new Promise((r) => setTimeout(r, 4000)),
    ]).then(() => alive && setReady(true));

    return () => {
      alive = false;
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = window.setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('intro-done'));
    }, 1900);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === 'done') return null;

  const [first, ...rest] = coupleNames.split('&').map((s) => s.trim());
  const second = rest.join(' & ');

  return (
    <div
      ref={rootRef}
      className={`floral-intro ${ready ? 'is-ready' : ''} ${phase === 'opening' ? 'is-opening' : ''}`}
      onClick={open}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
    >
      <div className="intro-flowers" aria-hidden>
        {PIECES.map((p, i) => (
          <div
            key={i}
            className="intro-piece"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}vmax`,
                zIndex: p.z,
                '--rot': `${p.rot}deg`,
                '--fx': `${p.fx}vmax`,
                '--fy': `${p.fy}vmax`,
                '--fr': `${p.fr}deg`,
                '--in': `${p.delay}ms`,
                '--out': `${p.out}ms`,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="intro-inner">
              <img src={`/florals/${p.src}.webp?v=2`} alt="" draggable={false} loading="lazy" decoding="async" />
            </div>
          </div>
        ))}
      </div>
      <div className="intro-card">
        <div className="font-sans text-[11px] uppercase tracking-[0.4em] text-steel">The wedding of</div>
        <div className="font-vibes text-[clamp(52px,9vw,96px)] leading-[1.05] text-ink">
          {first}
          {second && <span className="text-steel"> &amp; </span>}
          {second}
        </div>
        <div className="intro-hint font-sans text-[10px] uppercase tracking-[0.35em] text-muted">Tap to open</div>
      </div>
    </div>
  );
}
