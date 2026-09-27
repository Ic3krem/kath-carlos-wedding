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

/** A speck of glitter shed by the cursor or thrown by a click. */
interface Glitter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  spin: number;
  color: string;
  /** Petals flutter and fall slowly instead of sparkling. */
  petal?: boolean;
  flutter?: number;
}

const PETAL_COLORS = ['#FFFFFF', '#EEF4F9', '#C6D6E4', '#A9BDD0', '#8AA4BB', '#DCE7F0'];

/** Fire `window.dispatchEvent(new CustomEvent('petal-burst', { detail }))` from anywhere. */
export interface PetalBurst {
  /** 'shower' rains from the top; 'sides' blows in from both edges; 'point' bursts at x/y. */
  mode: 'shower' | 'sides' | 'point';
  count?: number;
  x?: number;
  y?: number;
}

const GLITTER_COLORS = ['#FFFFFF', '#DCE7F0', '#8AA4BB', '#F3E3B5', '#C9D8E6'];

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

    // Pointer state. Touch screens only get the tap burst; the trail and the
    // companion butterfly need a hovering mouse to make sense.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const pointer = { x: -9999, y: -9999, active: false, lastX: -9999, lastY: -9999 };
    const glitter: Glitter[] = [];
    const MAX_GLITTER = 420;

    function spawnPetal(x: number, y: number, vx: number, vy: number) {
      if (glitter.length >= MAX_GLITTER) return;
      const maxLife = random(5, 9);
      glitter.push({
        x,
        y,
        vx,
        vy,
        size: random(3.5, 7),
        life: maxLife,
        maxLife,
        spin: random(0, Math.PI * 2),
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        petal: true,
        flutter: random(0, Math.PI * 2),
      });
    }

    function onBurst(e: Event) {
      const d = (e as CustomEvent<PetalBurst>).detail ?? { mode: 'shower' };
      const count = Math.min(d.count ?? 80, 200);
      for (let i = 0; i < count; i++) {
        if (d.mode === 'shower') {
          spawnPetal(random(0, width), random(-120, -10), random(-20, 20), random(20, 70));
        } else if (d.mode === 'sides') {
          const fromLeft = i % 2 === 0;
          spawnPetal(fromLeft ? random(-30, 0) : width + random(0, 30), random(height * 0.1, height * 0.7), (fromLeft ? 1 : -1) * random(120, 320), random(-80, 20));
        } else {
          const a = random(0, Math.PI * 2);
          const sp = random(60, 260);
          spawnPetal(d.x ?? width / 2, d.y ?? height / 2, Math.cos(a) * sp, Math.sin(a) * sp - 80);
        }
      }
    }
    // One butterfly that follows the mouse around, lagging behind like it's curious.
    const companion = { x: -100, y: -100, flap: 0, angle: 0, visible: false };

    function spawnGlitter(x: number, y: number, count: number, force: number) {
      for (let i = 0; i < count && glitter.length < MAX_GLITTER; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(0.2, 1) * force;
        const maxLife = random(0.6, 1.3);
        glitter.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - force * 0.3,
          size: random(0.8, 2.6),
          life: maxLife,
          maxLife,
          spin: random(0, Math.PI),
          color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
        });
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.active) {
        pointer.active = true;
        companion.x = e.clientX - 60;
        companion.y = e.clientY + 40;
        companion.visible = true;
      }
      const dx = pointer.x - pointer.lastX;
      const dy = pointer.y - pointer.lastY;
      if (dx * dx + dy * dy > 140) {
        spawnGlitter(pointer.x, pointer.y, 2, 30);
        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;
      }
    }

    function onPointerDown(e: PointerEvent) {
      spawnGlitter(e.clientX, e.clientY, e.pointerType === 'mouse' ? 18 : 14, 160);
      for (let i = 0; i < 5; i++) {
        const a = random(0, Math.PI * 2);
        spawnPetal(e.clientX, e.clientY, Math.cos(a) * random(40, 140), Math.sin(a) * random(40, 140) - 60);
      }
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    }

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

        let y = butterfly.y + Math.sin(butterfly.wavePhase) * butterfly.waveHeight;

        // Shy of the cursor: butterflies that come close flutter out of the way.
        if (pointer.active) {
          const dx = butterfly.x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const radius = 130;
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2) || 1;
            const push = ((radius - d) / radius) * 260 * delta;
            butterfly.x += (dx / d) * push;
            butterfly.y += (dy / d) * push;
            y += (dy / d) * push;
            butterfly.flapPhase += 10 * delta;
          }
        }

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

      // Glitter shed by the cursor and thrown by clicks.
      for (let i = glitter.length - 1; i >= 0; i--) {
        const g = glitter[i];
        g.life -= delta;
        if (g.life <= 0) {
          glitter.splice(i, 1);
          continue;
        }
        const t = g.life / g.maxLife;
        if (g.petal) {
          // Petals: light, with air resistance and a side-to-side flutter.
          g.flutter! += 3.2 * delta;
          g.vy += 40 * delta;
          g.vy = Math.min(g.vy, 70);
          g.vx *= 1 - 1.4 * delta;
          g.x += (g.vx + Math.sin(g.flutter!) * 30) * delta;
          g.y += g.vy * delta;
          g.spin += Math.cos(g.flutter!) * 1.6 * delta;
          if (g.y > height + 30) {
            glitter.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.spin);
          // Squash on one axis as it tumbles, which reads as a 3D flip.
          ctx.scale(1, 0.35 + Math.abs(Math.sin(g.flutter!)) * 0.65);
          ctx.globalAlpha = Math.min(1, t * 3) * 0.92;
          ctx.fillStyle = g.color;
          ctx.shadowColor = 'rgba(44,62,80,0.18)';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.moveTo(0, g.size * 1.4);
          ctx.bezierCurveTo(-g.size * 1.2, g.size * 0.5, -g.size, -g.size, 0, -g.size * 1.5);
          ctx.bezierCurveTo(g.size, -g.size, g.size * 1.2, g.size * 0.5, 0, g.size * 1.4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha *= 0.5;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(-g.size * 0.25, -g.size * 0.3, g.size * 0.3, g.size * 0.7, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        g.vy += 60 * delta; // a little gravity
        g.vx *= 1 - 2.2 * delta;
        g.x += g.vx * delta;
        g.y += g.vy * delta;
        g.spin += 3 * delta;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.spin);
        ctx.globalAlpha = Math.min(1, t * 1.6) * 0.9;
        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 6;
        drawSparkle(ctx, g.size * (0.6 + t * 0.4));
        ctx.restore();
      }

      // The companion butterfly eases toward a spot just off the cursor.
      if (finePointer && companion.visible) {
        const tx = pointer.active ? pointer.x + 26 : companion.x;
        const ty = pointer.active ? pointer.y - 22 : companion.y - 8;
        const dx = tx - companion.x;
        const dy = ty - companion.y;
        companion.x += dx * Math.min(1, 2.6 * delta);
        companion.y += dy * Math.min(1, 2.6 * delta) + Math.sin(now / 380) * 0.35;
        const moving = Math.min(1, Math.hypot(dx, dy) / 80);
        companion.flap += (7 + moving * 10) * delta;
        companion.angle += (Math.max(-0.5, Math.min(0.5, dx / 160)) - companion.angle) * Math.min(1, 4 * delta);

        const spread = 0.25 + Math.abs(Math.sin(companion.flap)) * 0.75;
        ctx.save();
        ctx.translate(companion.x, companion.y);
        ctx.rotate(companion.angle);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#5E7D9A';
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 8;
        ctx.save();
        ctx.scale(spread, 1);
        drawWings(ctx, 13);
        ctx.scale(-1, 1);
        drawWings(ctx, 13);
        ctx.restore();
        ctx.fillStyle = '#2F4358';
        ctx.beginPath();
        ctx.ellipse(0, 13 * 0.15, 13 * 0.08, 13 * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('petal-burst', onBurst);
    // A gentle shower of petals to welcome each guest.
    const welcome = window.setTimeout(() => onBurst(new CustomEvent('petal-burst', { detail: { mode: 'shower', count: width < 640 ? 40 : 70 } })), 700);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('petal-burst', onBurst);
      window.clearTimeout(welcome);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
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
