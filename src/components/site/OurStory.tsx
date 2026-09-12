'use client';

import { useState } from 'react';
import type { OurStory as OurStoryData } from '@/lib/types';
import { StoryModal } from './StoryModal';

function StoryImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="aspect-[3/2] w-full rounded-2xl object-cover shadow-sm" />
  );
}

function StoryText({ children }: { children: React.ReactNode }) {
  return <p className="whitespace-pre-line text-center text-sm leading-relaxed text-black/60 sm:text-base">{children}</p>;
}

export function OurStory({ story }: { story: OurStoryData }) {
  const [open, setOpen] = useState(false);
  const secondImage = story.image_url_2 ?? story.image_url;
  const secondText = story.excerpt_2?.trim() ? story.excerpt_2 : null;

  return (
    <section id="our-story" className="flex w-full flex-col items-center gap-6 px-4 py-5 sm:px-8 sm:py-7 lg:gap-10 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">Our Story</h2>

      <div className="flex w-full max-w-[1550px] flex-col gap-10 lg:gap-16">
        {/* Row 1 — image left, text right */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-14">
          {story.image_url && (
            <div className="w-full lg:w-[55%]">
              <StoryImage src={story.image_url} alt={story.title} />
            </div>
          )}
          <div className="flex w-full flex-col gap-4 lg:w-[45%]">
            <StoryText>{story.excerpt}</StoryText>
            {/* Button lives here on mobile, where the second row's image is hidden */}
            {!secondText && (
              <button
                onClick={() => setOpen(true)}
                className="mx-auto rounded-md bg-accent px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white"
              >
                {story.button_label}
              </button>
            )}
          </div>
        </div>

        {/* Row 2 — text left, image right. The image is hidden on mobile. */}
        {secondText && (
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-14">
            <div className="order-2 flex w-full flex-col gap-4 lg:order-1 lg:w-[45%]">
              <StoryText>{secondText}</StoryText>
              <button
                onClick={() => setOpen(true)}
                className="mx-auto rounded-md bg-accent px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white"
              >
                {story.button_label}
              </button>
            </div>
            {secondImage && (
              <div className="order-1 hidden w-full lg:order-2 lg:block lg:w-[55%]">
                <StoryImage src={secondImage} alt={story.title} />
              </div>
            )}
          </div>
        )}
      </div>

      <StoryModal open={open} title={story.title} fullStory={story.full_story} onClose={() => setOpen(false)} />
    </section>
  );
}
