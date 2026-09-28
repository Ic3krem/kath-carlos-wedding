'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoryMilestone } from '@/lib/types';
import { CloseButton, Modal } from './Modal';

interface StoryTextProps {
  milestone: Omit<StoryMilestone, 'id'>;
  chapter: number;
}

const cleanQuote = (q: string) => q.replace(/^[“"]|[”"]$/g, '');

/**
 * The text beside a story photo, cut to the photo's height (on desktop the
 * column is absolutely filled so the text never makes the row taller; on
 * phones it is capped at a few lines). "See more" opens the whole chapter.
 */
export function StoryText({ milestone: m, chapter }: StoryTextProps) {
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const label = `Chapter ${String(chapter).padStart(2, '0')}`;

  // Only fade the last line when the text is actually cut off.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const check = () => setClipped(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="flex h-full flex-col gap-3 md:absolute md:inset-0">
        <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-label">{label}</span>
        <h3 className="m-0 text-[clamp(26px,3vw,32px)] font-medium leading-[1.15]">{m.title}</h3>
        <div ref={bodyRef} className="relative min-h-0 flex-1 overflow-hidden max-md:max-h-[8.4em] max-md:flex-none">
          <p className="m-0 text-[18px] leading-relaxed text-body sm:text-[19px]">{m.body}</p>
          {m.quote && (
            <blockquote className="m-0 mt-3 border-l-2 border-dusty pl-[18px] text-[18px] italic leading-normal text-steel sm:text-[19px]">
              “{cleanQuote(m.quote)}”
            </blockquote>
          )}
          {clipped && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-shine group mt-1 flex w-fit items-center gap-2 rounded-full border border-steel/40 bg-white/70 px-5 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-steel transition-colors hover:bg-steel hover:text-white"
        >
          See more
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      <Modal open={open} onClose={close} label={`${label}: ${m.title}`} className="overflow-auto">
        <div className="grid md:grid-cols-2">
          {m.image_url && (
            <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[480px]">
              <Image
                src={m.image_url}
                alt={m.caption || m.title}
                fill
                sizes="(min-width: 768px) 550px, 100vw"
                quality={82}
                loading="eager"
                className="object-cover md:rounded-l-2xl"
              />
            </div>
          )}
          <div className="flex flex-col gap-4 px-6 py-7 sm:px-9 sm:py-9">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-label">{label}</span>
                <h3 className="m-0 font-script text-[clamp(30px,4vw,40px)] font-normal leading-[1.15] text-ink">{m.title}</h3>
              </div>
              <CloseButton onClick={close} />
            </div>
            <div className="h-px bg-mist" />
            {m.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="m-0 text-[18px] leading-relaxed text-body">
                  {para}
                </p>
              ))}
            {m.quote && (
              <blockquote className="m-0 border-l-2 border-dusty pl-[18px] text-[19px] italic leading-normal text-steel">
                “{cleanQuote(m.quote)}”
              </blockquote>
            )}
            {m.caption && <p className="m-0 mt-auto font-sans text-[11px] uppercase tracking-[0.2em] text-muted">{m.caption}</p>}
          </div>
        </div>
      </Modal>
    </>
  );
}
