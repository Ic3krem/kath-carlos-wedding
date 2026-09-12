'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage, GalleryShape } from '@/lib/types';

const PREVIEW_LIMIT = 12;

// Repeating mosaic template. Any number of photos tiles into it, so new
// uploads are auto-shaped without anyone picking a size.
const AUTO_TEMPLATE: Exclude<GalleryShape, null>[] = [
  'tall',
  'square',
  'square',
  'tall',
  'wide',
  'square',
  'tall',
  'square',
];

const SHAPE_CLASS: Record<Exclude<GalleryShape, null>, string> = {
  square: 'col-span-1 row-span-1',
  tall: 'col-span-1 row-span-2',
  wide: 'col-span-2 row-span-1',
};

function shapeFor(image: GalleryImage, index: number): Exclude<GalleryShape, null> {
  return image.shape ?? AUTO_TEMPLATE[index % AUTO_TEMPLATE.length];
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = expanded ? images : images.slice(0, PREVIEW_LIMIT);
  const hasMore = images.length > PREVIEW_LIMIT;

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

  return (
    <section id="gallery" className="flex w-full flex-col items-center gap-8 px-4 py-10 sm:px-8 sm:py-12 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">View more of us</h2>

      <div className="grid w-full max-w-5xl auto-rows-[110px] grid-flow-dense grid-cols-2 gap-2 sm:auto-rows-[140px] sm:grid-cols-3 sm:gap-3 lg:auto-rows-[160px] lg:grid-cols-4">
        {visible.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setLightboxIndex(index)}
            className={`group relative overflow-hidden rounded-lg ${SHAPE_CLASS[shapeFor(image, index)]}`}
            aria-label={image.caption ?? 'Open photo'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt={image.caption ?? ''}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {image.caption && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-left text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {image.caption}
              </span>
            )}
          </button>
        ))}
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
