'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/types';

const PREVIEW_DESKTOP = 6;
const PREVIEW_MOBILE = 4;
const MOBILE_MAX_WIDTH = 768;

/** Deterministic pseudo-random from the image id so server and client agree. */
function seeded(id: string, salt: number) {
  let hash = salt;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  return (hash % 1000) / 1000; // 0..1
}

const GRID_GAP = '1.5rem';

/**
 * Before the settle, every card is pulled back to the middle of the grid so
 * they sit in one rotated pile, then each animates out to its own slot.
 * Offsets are expressed against the card's own size, so they hold at any width.
 */
function pileStyle(image: GalleryImage, index: number, columns: number, total: number): React.CSSProperties {
  const rows = Math.ceil(total / columns);
  const col = index % columns;
  const row = Math.floor(index / columns);
  const dx = (columns - 1) / 2 - col;
  const dy = (rows - 1) / 2 - row;
  const rot = Math.round((seeded(image.id, 29) - 0.5) * 36);
  const jitterX = Math.round((seeded(image.id, 7) - 0.5) * 28);
  const jitterY = Math.round((seeded(image.id, 13) - 0.5) * 22);

  return {
    transform: `translate(calc(${dx} * (100% + ${GRID_GAP}) + ${jitterX}px), calc(${dy} * (100% + ${GRID_GAP}) + ${jitterY}px)) rotateZ(${rot}deg)`,
    zIndex: Math.round(seeded(image.id, 53) * 10),
  };
}

function Postcard({
  image,
  onClick,
  style,
}: {
  image: GalleryImage;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button className="postcard aspect-[3/2] w-full" style={style} onClick={onClick} aria-label={image.caption ?? 'Open photo'}>
      <div className="postcard__front">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.image_url} alt={image.caption ?? ''} width={1280} height={790} loading="lazy" />
      </div>
    </button>
  );
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [previewCount, setPreviewCount] = useState(PREVIEW_DESKTOP);
  const [organized, setOrganized] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = () => setPreviewCount(window.innerWidth < MOBILE_MAX_WIDTH ? PREVIEW_MOBILE : PREVIEW_DESKTOP);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // Cards start scattered and settle into the grid once, when scrolled to.
  useEffect(() => {
    const node = gridRef.current;
    if (!node || organized) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOrganized(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [organized]);

  const preview = useMemo(() => images.slice(0, previewCount), [images, previewCount]);
  const hasMore = images.length > previewCount;
  const columns = previewCount === PREVIEW_MOBILE ? 2 : 3;

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

  useEffect(() => {
    if (!showAll) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowAll(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAll]);

  if (images.length === 0) return null;

  const active = lightboxIndex === null ? null : images[lightboxIndex];

  return (
    <section id="gallery" className="flex w-full flex-col items-center gap-6 px-1.5 py-12 sm:px-3 sm:py-16 lg:px-6 lg:py-20">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">View more of us</h2>

      <div ref={gridRef} className="grid w-full max-w-[1550px] grid-cols-2 md:grid-cols-3" style={{ gap: GRID_GAP }}>
        {preview.map((image, index) => (
          <Postcard
            key={image.id}
            image={image}
            style={
              organized
                ? { transform: 'none', transitionDelay: `${index * 70}ms` }
                : pileStyle(image, index, columns, preview.length)
            }
            onClick={() => setLightboxIndex(images.indexOf(image))}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="mx-auto rounded-md bg-accent px-8 py-2.5 text-xs font-semibold uppercase tracking-wide text-white"
        >
          See more
        </button>
      )}

      {/* All photos, framed like the gallery postcards */}
      {showAll && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowAll(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="postcard__front max-h-[85vh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded"
            style={{ padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-script text-3xl text-black sm:text-4xl">View more of us</h3>
              <button onClick={() => setShowAll(false)} className="text-3xl leading-none text-black/50 hover:text-black" aria-label="Close">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6">
              {images.map((image) => (
                <Postcard key={image.id} image={image} onClick={() => setLightboxIndex(images.indexOf(image))} />
              ))}
            </div>
          </div>
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/90 p-4"
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
            <div className="postcard__front rounded" style={{ padding: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.image_url}
                alt={active.caption ?? ''}
                width={1280}
                height={790}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
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
