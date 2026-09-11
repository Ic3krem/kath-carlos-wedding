'use client';

import { useState } from 'react';
import type { OurStory as OurStoryData } from '@/lib/types';
import { StoryModal } from './StoryModal';

export function OurStory({ story }: { story: OurStoryData }) {
  const [open, setOpen] = useState(false);

  return (
    <section id="our-story" className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Our Story</h2>
      <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
        {story.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.image_url} alt={story.title} className="aspect-[576/388] w-full max-w-lg rounded-2xl object-cover lg:flex-1" />
        )}
        <div className="flex w-full max-w-md flex-col items-start gap-6">
          <h3 className="text-3xl font-bold text-primary sm:text-4xl">{story.title}</h3>
          <p className="text-black/55">{story.excerpt}</p>
          <button onClick={() => setOpen(true)} className="rounded-lg border border-primary px-6 py-3 text-primary">
            {story.button_label}
          </button>
        </div>
      </div>
      <StoryModal open={open} title={story.title} fullStory={story.full_story} onClose={() => setOpen(false)} />
    </section>
  );
}
