'use client';

import { useEffect, useRef } from 'react';

/**
 * Butterflies and stardust drifting over the whole page.
 *
 * Canvas 2D rather than a 3D library: the whole effect is a few dozen small
 * shapes, so it costs a few kilobytes of code instead of the few hundred a
 * WebGL runtime would add to the first load. The canvas is fixed, behind
 * nothing and clickable through, so it never interferes with the page.
 */

/** Palette colours, so the swarm reads as part of the dusty blue theme. */
const COLORS = ['#8AA2B8', '#5E7D9A', '#D7E1EA', '#2F4358', '#FFFFFF'];

interface Butterfly {
  x: number;
  y: number;
  size: number;
  /** Horizontal drift, px per second. */
  speedX: number;
  /** How far it rises and falls, and how quickly. */
  waveHeight: number;
  waveSpeed: number;
  wavePhase: number;
  flapSpeed: number;
  flapPhase: number;
  tilt: number;
  color: string;
  opacity: number;
}

/** Stardust is warmer than the butterflies, so it reads as light, not colour. */
const DUST_COLORS = ['#FFFFFF', '#EAF1F8', '#D7E1EA', '#C9D8E6'];

interface Dust {
  x: number;
  y: number;
  size: number;
  /** Slow upward drift with a sideways sway. */
  riseSpeed: number;
  swayWidth: number;
  swaySpeed: number;
  swayPhase: number;
  twinkleSpeed: number;
  twinklePhase: number;
  peakOpacity: number;
  color: string;
  /** The bigger motes get a four-point sparkle instead of a plain dot. */
  sparkle: boolean;
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeDust(width: number, height: number, atBottom: boolean): Dust {
  const size = random(0.7, 2.4);
  return {
    x: random(0, width),
    y: atBottom ? height + random(0, 40) : random(0, height),
    size,
    riseSpeed: random(6, 20),
    swayWidth: random(4, 18),
    swaySpeed: random(0.2, 0.7),
    swayPhase: random(0, Math.PI * 2),
    twinkleSpeed: random(0.8, 2.4),
    twinklePhase: random(0, Math.PI * 2),
    peakOpacity: random(0.16, 0.3),
    color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
    sparkle: size > 1.8,
  };
}

/** A four-point star: two crossed tapers, which is what a sparkle reads as. */
function drawSparkle(ctx: CanvasRenderingContext2D, size: number) {
  const long = size * 4;
  const short = size * 0.55;
  ctx.beginPath();
  ctx.moveTo(0, -long);
  ctx.quadraticCurveTo(short, -short, long, 0);
  ctx.quadraticCurveTo(short, short, 0, long);
  ctx.quadraticCurveTo(-short, short, -long, 0);
  ctx.quadraticCurveTo(-short, -short, 0, -long);
  ctx.closePath();
  ctx.fill();
}

function makeButterfly(width: number, height: number, offscreen: boolean): Butterfly {
  const size = random(9, 20);
  const leftToRight = Math.random() < 0.5;
  return {
    x: offscreen ? (leftToRight ? -size * 3 : width + size * 3) : random(0, width),
    y: random(height * 0.05, height * 0.95),
    size,
    speedX: (leftToRight ? 1 : -1) * random(14, 34),
    waveHeight: random(12, 46),
    waveSpeed: random(0.3, 0.8),
    wavePhase: random(0, Math.PI * 2),
    flapSpeed: random(6, 11),
    flapPhase: random(0, Math.PI * 2),
    tilt: random(-0.25, 0.25),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: random(0.14, 0.3),
  };
}

/** One wing pair, drawn from the body outward; mirrored for the other side. */
function drawWings(ctx: CanvasRenderingContext2D, size: number) {
  // Forewing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.95, -size * 1.15, -size * 1.55, -size * 0.15, -size * 0.5, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Hindwing
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.bezierCurveTo(-size * 0.8, size * 0.3, -size * 0.85, size * 1.05, -size * 0.18, size * 0.6);
  ctx.closePath();
  ctx.fill();
}

export function MagicOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // A guest who asks for less motion gets none of this.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let butterflies: Butterfly[] = [];
    let dust: Dust[] = [];
    let frame = 0;
    let last = performance.now();

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap the pixel ratio: past 2x the extra pixels cost more than they show.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Fewer on a phone, where there is less room and less battery to spare.
      const count = width < 640 ? 7 : width < 1024 ? 11 : 15;
      if (butterflies.length !== count) {
        butterflies = Array.from({ length: count }, () => makeButterfly(width, height, false));
      }

      const dustCount = width < 640 ? 45 : width < 1024 ? 75 : 110;
      if (dust.length !== dustCount) {
        dust = Array.from({ length: dustCount }, () => makeDust(width, height, false));
      }
    }

    function draw(now: number) {
      if (!ctx) return;
      // Seconds since the last frame, clamped so a backgrounded tab does not
      // teleport everything across the screen when it wakes up.
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, width, height);

      // Stardust first, so the butterflies pass in front of it.
      for (const mote of dust) {
        mote.y -= mote.riseSpeed * delta;
        mote.swayPhase += mote.swaySpeed * delta;
        mote.twinklePhase += mote.twinkleSpeed * delta;

        // A half-wave, so each mote spends part of its cycle fully dark.
        const twinkle = Math.max(0, Math.sin(mote.twinklePhase));
        if (twinkle > 0.01) {
          ctx.save();
          ctx.translate(mote.x + Math.sin(mote.swayPhase) * mote.swayWidth, mote.y);
          ctx.globalAlpha = twinkle * mote.peakOpacity;
          ctx.fillStyle = mote.color;
          if (mote.sparkle) {
            ctx.rotate(mote.swayPhase * 0.2);
            drawSparkle(ctx, mote.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, mote.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Risen off the top: start it again from below.
        if (mote.y < -20) {
          Object.assign(mote, makeDust(width, height, true));
        }
      }

      for (const butterfly of butterflies) {
        butterfly.x += butterfly.speedX * delta;
        butterfly.wavePhase += butterfly.waveSpeed * delta;
        butterfly.flapPhase += butterfly.flapSpeed * delta;

        const y = butterfly.y + Math.sin(butterfly.wavePhase) * butterfly.waveHeight;

        // Wings squash horizontally as they beat, which reads as perspective.
        const flap = Math.abs(Math.sin(butterfly.flapPhase));
        const spread = 0.25 + flap * 0.75;

        ctx.save();
        ctx.translate(butterfly.x, y);
        // Tip into the direction of travel, and bank slightly with the climb.
        ctx.rotate(butterfly.tilt + Math.cos(butterfly.wavePhase) * 0.18);
        ctx.globalAlpha = butterfly.opacity;
        ctx.fillStyle = butterfly.color;

        ctx.save();
        ctx.scale(spread, 1);
        drawWings(ctx, butterfly.size);
        ctx.scale(-1, 1);
        drawWings(ctx, butterfly.size);
        ctx.restore();

        // Body
        ctx.beginPath();
        ctx.ellipse(0, butterfly.size * 0.15, butterfly.size * 0.07, butterfly.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Once clear of the edge, send it back in from the other side.
        const margin = butterfly.size * 3;
        if (butterfly.speedX > 0 && butterfly.x > width + margin) {
          Object.assign(butterfly, makeButterfly(width, height, true), { speedX: butterfly.speedX });
          butterfly.x = -margin;
        } else if (butterfly.speedX < 0 && butterfly.x < -margin) {
          Object.assign(butterfly, makeButterfly(width, height, true), { speedX: butterfly.speedX });
          butterfly.x = width + margin;
        }
      }

      frame = requestAnimationFrame(draw);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}
