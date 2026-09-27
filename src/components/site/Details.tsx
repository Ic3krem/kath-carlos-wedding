'use client';

import { useCallback, useState } from 'react';
import type { TimelineItem } from '@/lib/types';
import { Icon } from './Icons';
import { CloseButton, Modal } from './Modal';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export interface Venue {
  kind: 'Ceremony' | 'Reception';
  name: string;
  address: string;
  embedUrl: string;
  mapsUrl: string;
  steps: string[];
}

interface DetailsProps {
  dateLabel: string;
  weekday: string;
  time: string;
  venues: Venue[];
  timeline: Omit<TimelineItem, 'id'>[];
  timelineNote: string;
}

export function Details({ dateLabel, weekday, time, venues, timeline, timelineNote }: DetailsProps) {
  const [open, setOpen] = useState<Venue | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="details" className="bg-paper px-6 py-[88px]">
      <Reveal>
        <SectionHeading eyebrow="The Details" title="When & Where" />
      </Reveal>

      <Reveal className="mx-auto mt-7 flex max-w-[960px] flex-col items-center gap-3.5 text-center">
        <div className="font-sans text-[11px] uppercase tracking-[0.35em] text-label">Date &amp; Time</div>
        <div className="font-script text-[clamp(44px,6.5vw,72px)] leading-[1.05] text-ink">{dateLabel}</div>
        <div className="flex items-center gap-[18px] font-sans text-[clamp(13px,1.5vw,16px)] font-semibold uppercase tracking-[0.3em] text-steel">
          <span>{weekday}</span>
          <span className="h-[18px] w-px bg-dusty" />
          <span>{time}</span>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-10 grid max-w-[680px] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5 text-center">
        {venues.map((venue) => (
          <div key={venue.kind} className="flex flex-col items-center gap-2 rounded-xl bg-white px-[22px] py-[30px] shadow-card">
            <Icon name={venue.kind === 'Ceremony' ? 'church' : 'reception'} size={26} color="#4f6f8f" />
            <h3 className="mb-0.5 mt-1 text-[22px] font-medium">{venue.kind}</h3>
            <div className="text-lg leading-normal text-body">
              {venue.name}
              <br />
              {venue.address}
            </div>
            <button
              type="button"
              onClick={() => setOpen(venue)}
              className="mt-2.5 cursor-pointer rounded-full border-0 bg-steel px-6 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-steel-dark"
            >
              Open Guide
            </button>
          </div>
        ))}
      </Reveal>

      <Reveal className="mx-auto mt-14 flex max-w-[960px] flex-col items-center gap-7 text-center">
        <h3 className="m-0 text-[28px] font-medium">Wedding Timeline</h3>
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
          {timeline.map((item, i) => (
            <div
              key={`${item.time_label}-${i}`}
              className="relative mt-6 flex flex-col gap-1 rounded-xl bg-white px-3 pb-[18px] pt-[38px] shadow-card"
            >
              <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-steel shadow-[0_4px_12px_rgba(79,111,143,0.3)]">
                <Icon name={item.icon} color="#fff" strokeWidth={1.6} />
              </div>
              <div className="text-[22px] font-semibold">{item.time_label}</div>
              <div className="text-base text-body">{item.label}</div>
            </div>
          ))}
        </div>
        {timelineNote && <p className="m-0 max-w-[680px] text-[17px] italic leading-relaxed text-body">{timelineNote}</p>}
      </Reveal>

      <Modal open={!!open} onClose={close} label={open ? `${open.kind} guide` : 'Venue guide'} zIndex="z-[45]" className="overflow-auto">
        {open && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]">
            <div className="flex flex-col gap-[18px] px-7 py-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-label">{open.kind}</span>
                  <span className="font-script text-[34px] leading-[1.15] text-ink">{open.name}</span>
                  <span className="text-lg text-body">{open.address}</span>
                </div>
                <CloseButton onClick={close} />
              </div>
              <div className="h-px bg-mist" />
              {open.steps.length > 0 && (
                <div className="flex flex-col gap-3.5">
                  <h4 className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-steel">Directions</h4>
                  {open.steps.map((step, i) => (
                    <div key={i} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist font-sans text-xs font-semibold text-steel-deep">
                        {i + 1}
                      </span>
                      <p className="m-0 mt-[3px] text-[17px] leading-[1.55] text-body">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              <a
                href={open.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto self-start font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-steel hover:text-steel-deep"
              >
                Open in Google Maps ↗
              </a>
            </div>
            <div className="min-h-[420px] bg-mist">
              <iframe
                src={open.embedUrl}
                title={`Map to ${open.name}`}
                loading="lazy"
                className="block h-full min-h-[420px] w-full border-0"
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
