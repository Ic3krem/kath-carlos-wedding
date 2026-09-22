'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { OurStory as OurStoryData, StoryMilestone } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionDivider, SectionIntro } from './SectionIntro';

// StoryModal is an interaction-only overlay (renders null until "Continue
// Reading" is clicked); load it lazily so it doesn't ship in the initial bundle.
const StoryModal = dynamic(() => import('./StoryModal').then((m) => m.StoryModal), { ssr: false });

type Milestone = Omit<StoryMilestone, 'id'>;

function MilestoneImage({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-2xl border border-black/10 bg-white p-2.5 shadow-sm">
      <div className="overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={1280}
          height={960}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] motion-reduce:hover:scale-100"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm italic text-black/45">{caption}</figcaption>
      )}
    </figure>
  );
}

export function OurStory({ story, milestones }: { story: OurStoryData; milestones: Milestone[] }) {
  const [open, setOpen] = useState(false);
  // Milestones that carry no image of their own borrow the two story images, so
  // the section still reads as a photo essay before any are uploaded.
  const spares = [story.image_url, story.image_url_2].filter(Boolean) as string[];

  return (
    <section
      id="our-story"
      className="flex w-full flex-col items-center gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:gap-10 lg:px-10 lg:py-20"
    >
      <SectionIntro title="How Our Journey Began" />
      <span aria-hidden className="-mt-4 text-lg text-accent">
        ❦
      </span>

      <div className="flex w-full max-w-[1100px] flex-col gap-16 lg:gap-24">
        {milestones.map((milestone, index) => {
          const image = milestone.image_url ?? spares[index % Math.max(spares.length, 1)] ?? null;
          const flipped = index % 2 === 1;

          return (
            <div key={`${milestone.sort_order}-${milestone.title}`} className="contents">
              {index > 0 && <SectionDivider />}
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
                <Reveal
                  from={flipped ? 'right' : 'left'}
                  // Centred on phones, where the text sits under its own photo in
                  // one column; left-aligned again from md, where it pairs with
                  // the image side by side.
                  className={`flex flex-col gap-4 text-center md:col-span-6 md:text-left ${
                    flipped ? 'md:order-2 md:pl-6' : 'md:pr-6'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                      {milestone.era}
                    </span>
                    <span className="text-xs text-black/45">·</span>
                    <span className="text-xs text-black/45">{milestone.place}</span>
                  </div>

                  <h3 className="text-2xl text-black sm:text-3xl">{milestone.title}</h3>

                  <p className="text-sm leading-relaxed text-black/60 sm:text-base">{milestone.body}</p>

                  {milestone.quote && (
                    <p className="font-script text-2xl leading-snug text-accent sm:text-3xl">
                      “{milestone.quote}”
                    </p>
                  )}
                </Reveal>

                {image && (
                  <Reveal
                    from={flipped ? 'left' : 'right'}
                    delay={120}
                    className={`md:col-span-6 ${flipped ? 'md:order-1' : ''}`}
                  >
                    <MilestoneImage src={image} alt={milestone.title} caption={milestone.caption} />
                  </Reveal>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {story.full_story?.trim() && (
        <Reveal>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-accent px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 motion-reduce:hover:translate-y-0"
          >
            {story.button_label}
          </button>
        </Reveal>
      )}

      <StoryModal open={open} title={story.title} fullStory={story.full_story} onClose={() => setOpen(false)} />
    </section>
  );
}
