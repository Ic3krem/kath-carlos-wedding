'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/types';

const PREVIEW_LIMIT = 12;
const COLUMNS = 3;
const WIDTH = 300;
const HEIGHT = 200;
const CARD_W = WIDTH + 40;
const CARD_H = HEIGHT + 60;
// Below this the scatter transforms overflow the viewport, so cards stay put.
const SCATTER_MIN_WIDTH = 768;

interface Offset {
  row: number;
  col: number;
  rot: number;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

function buildOffsets(rowsCount: number, rows: unknown[][], containerWidth: number) {
  const offsets: Record<string, Offset> = {};

  rows.forEach((row, i) =>
    row.forEach((_, j) => {
      // Centre of the grid slot, then jitter around it.
      const rowOffset = rowsCount / 2 - i;
      let translateY = rowOffset * CARD_H + rowOffset * 50;
      if (!(rowsCount % 2)) translateY = translateY ? translateY / 2 : -155;

      const colOffset = Math.floor(COLUMNS / 2 - j);
      let translateX = colOffset * CARD_W + (colOffset * (containerWidth - CARD_W * COLUMNS)) / COLUMNS;

      translateY += random(-CARD_H * 0.5, CARD_H * 0.5);
      translateX += random(-CARD_W * 0.5, CARD_W * 0.5);

      offsets[`${i},${j}`] = { row: translateY, col: translateX, rot: random(-60, 60) };
    })
  );

  return offsets;
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isHover, setIsHover] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, Offset> | null>(null);
  const [canScatter, setCanScatter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visible = expanded ? images : images.slice(0, PREVIEW_LIMIT);
  const hasMore = images.length > PREVIEW_LIMIT;
  const rows = chunk(visible, COLUMNS);

  // Re-scatter on mount and whenever the cards settle back out of hover.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const width = node.clientWidth;
    const scatterable = width >= SCATTER_MIN_WIDTH;
    setCanScatter(scatterable);
    setOffsets(scatterable ? buildOffsets(rows.length, rows, width) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHover, expanded, images.length]);

  useEffect(() => {
    function onResize() {
      const node = containerRef.current;
      if (!node) return;
      const scatterable = node.clientWidth >= SCATTER_MIN_WIDTH;
      setCanScatter(scatterable);
      setOffsets(scatterable ? buildOffsets(rows.length, rows, node.clientWidth) : null);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const close = useCallback(() => setLightboxIndex(null), []);
  const step = useCallback(
    (delta: number) => setLightboxIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, close, step]);

  if (images.length === 0) return null;

  const active = lightboxIndex === null ? null : images[lightboxIndex];

  function cardStyle(rowIndex: number, colIndex: number): React.CSSProperties {
    const base: React.CSSProperties = { width: CARD_W, height: CARD_H, maxWidth: '100%' };
    const offset = offsets?.[`${rowIndex},${colIndex}`];
    if (!canScatter || !offset) return base;
    return {
      ...base,
      transform: `translateX(${offset.col}px) translateY(${offset.row}px) rotateZ(${offset.rot}deg)`,
    };
  }

  return (
    <section id="gallery" className="flex w-full flex-col items-center gap-8 px-4 py-10 sm:px-8 sm:py-12 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">View more of us</h2>

      <div
        ref={containerRef}
        className={`gallery max-w-5xl ${isHover ? 'gallery-display' : ''}`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <div>
          {rows.map((row, rowIndex) => (
            <div className="gallery__row" key={rowIndex}>
              {row.map((image, colIndex) => (
                <div
                  className="gallery__row__image"
                  style={{ width: `${100 / COLUMNS}%` }}
                  key={image.id}
                >
                  <button
                    className="postcard"
                    style={cardStyle(rowIndex, colIndex)}
                    onClick={() => setLightboxIndex(images.indexOf(image))}
                    aria-label={image.caption ?? 'Open photo'}
                  >
                    <div className="postcard__front">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.image_url} alt={image.caption ?? ''} />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md bg-accent px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white"
        >
          {expanded ? 'Show less' : `View full gallery (${images.length})`}
        </button>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button onClick={close} className="absolute right-4 top-4 text-3xl leading-none text-white" aria-label="Close">
            &times;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 text-4xl leading-none text-white/70 hover:text-white sm:left-6"
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <figure className="flex max-h-full max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.image_url} alt={active.caption ?? ''} className="max-h-[80vh] w-auto rounded-lg object-contain" />
            {active.caption && <figcaption className="text-sm text-white/70">{active.caption}</figcaption>}
            <span className="text-xs text-white/40">
              {(lightboxIndex ?? 0) + 1} / {images.length}
            </span>
          </figure>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 text-4xl leading-none text-white/70 hover:text-white sm:right-6"
            aria-label="Next photo"
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}
