'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { CloseButton, Modal } from './Modal';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/** Row spans that give the masonry rhythm, repeating every six photos. */
const SPANS = ['row-span-2', 'row-span-1', 'row-span-2', 'row-span-2', 'row-span-1', 'row-span-1'];
const PREVIEW_COUNT = 6;

type Photo = Omit<GalleryImage, 'id'>;

function Tile({ photo, index, onOpen, animate }: { photo: Photo; index: number; onOpen: () => void; animate: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [animate]);

  const alt = photo.caption || `Carlos and Kath, photo ${index + 1}`;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={alt}
      data-reveal={animate ? '' : undefined}
      style={animate ? { transitionDelay: `${(index % 3) * 90}ms` } : undefined}
      className={`group block h-full w-full cursor-zoom-in overflow-hidden rounded-[10px] border-0 bg-line p-0 ${SPANS[index % 6]} ${
        animate
          ? `shadow-[0_6px_18px_rgba(44,62,80,0.15)] transition-[opacity,transform] duration-700 ease-out ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-[18px] opacity-0'
            }`
          : ''
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.image_url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
      />
    </button>
  );
}

export function Gallery({ images }: { images: Photo[] }) {
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState(-1);
  const touchX = useRef(0);
  const count = images.length;

  const step = useCallback((d: number) => setLightbox((i) => (i + d + count) % count), [count]);
  const closeAll = useCallback(() => setShowAll(false), []);
  const closeLightbox = useCallback(() => setLightbox(-1), []);

  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, step]);

  if (count === 0) return null;
  const current = lightbox >= 0 ? images[lightbox] : null;

  return (
    <section id="gallery" className="bg-mist px-6 py-[88px]">
      <Reveal>
        <SectionHeading eyebrow="Gallery" title="View more of us" />
      </Reveal>
      <div className="mx-auto mt-11 grid max-w-[960px] grid-cols-3 gap-[clamp(8px,1.4vw,14px)] [grid-auto-rows:clamp(110px,19vw,190px)]">
        {images.slice(0, PREVIEW_COUNT).map((photo, i) => (
          <Tile key={photo.image_url + i} photo={photo} index={i} onOpen={() => setLightbox(i)} animate />
        ))}
      </div>
      {count > PREVIEW_COUNT && (
        <div className="mt-9 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="cursor-pointer rounded-full border-0 bg-steel px-9 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-[0_4px_14px_rgba(79,111,143,0.25)] hover:bg-steel-dark"
          >
            View more photos
          </button>
        </div>
      )}

      <Modal open={showAll && lightbox < 0} onClose={closeAll} label="All photos" className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-mist px-6 py-[18px]">
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-label">Gallery</span>
            <span className="text-[26px] font-medium">All photos</span>
          </div>
          <CloseButton onClick={closeAll} />
        </div>
        <div className="overflow-y-auto px-6 pb-7 pt-5">
          <div className="grid grid-cols-3 gap-3 [grid-auto-rows:clamp(100px,16vw,180px)]">
            {images.map((photo, i) => (
              <Tile key={photo.image_url + i} photo={photo} index={i} onOpen={() => setLightbox(i)} animate={false} />
            ))}
          </div>
        </div>
      </Modal>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={closeLightbox}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) {
              e.preventDefault();
              step(dx < 0 ? 1 : -1);
            }
          }}
          className="fixed inset-0 z-50 flex flex-col bg-[rgba(20,30,40,0.92)]"
        >
          <LightboxEscape onClose={closeLightbox} />
          <div className="flex items-center justify-between px-6 py-4 font-sans text-xs tracking-[0.2em] text-white">
            <span>
              {lightbox + 1} / {count}
            </span>
            <button type="button" onClick={closeLightbox} className="cursor-pointer border-0 bg-transparent uppercase text-white">
              Close ✕
            </button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[64px_minmax(0,1fr)_64px] items-center">
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="h-full cursor-pointer border-0 bg-transparent text-3xl text-white"
            >
              ‹
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image_url}
              alt={current.caption || `Carlos and Kath, photo ${lightbox + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[calc(100vh-100px)] max-w-full justify-self-center rounded-md object-contain"
            />
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="h-full cursor-pointer border-0 bg-transparent text-3xl text-white"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function LightboxEscape({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return null;
}
