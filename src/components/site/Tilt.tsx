'use client';

import { useRef } from 'react';

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Adds a soft light that follows the cursor across the surface. */
  glare?: boolean;
}

/**
 * Leans its content toward the mouse in 3D. Mouse only — on touch it's inert,
 * and reduced-motion users get the flat version via the global CSS rule.
 */
export function Tilt({ children, className = '', max = 8, glare = true }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
      node.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
      node.style.setProperty('--gx', `${px * 100}%`);
      node.style.setProperty('--gy', `${py * 100}%`);
      node.dataset.tilting = '';
    });
  }

  function onLeave() {
    const node = ref.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
    delete node.dataset.tilting;
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt ${glare ? 'tilt-glare' : ''} ${className}`}>
      {children}
    </div>
  );
}
