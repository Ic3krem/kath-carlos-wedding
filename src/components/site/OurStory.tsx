import type { StoryMilestone } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export function OurStory({ milestones }: { milestones: Omit<StoryMilestone, 'id'>[] }) {
  return (
    <section id="story" className="bg-paper px-6 py-[88px]">
      <Reveal>
        <SectionHeading eyebrow="Our Story" title="How Our Journey Began" />
      </Reveal>
      <div className="mx-auto mt-12 flex max-w-[1000px] flex-col gap-[72px]">
        {milestones.map((m, i) => (
          <Reveal
            key={`${m.title}-${i}`}
            as="div"
            className={`flex flex-wrap items-center gap-12 ${i % 2 === 1 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {m.image_url && (
              <figure className="m-0 flex flex-[1_1_340px] flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image_url}
                  alt={m.caption || m.title}
                  loading="lazy"
                  className="block aspect-[4/3] w-full rounded-xl object-cover shadow-photo"
                />
              </figure>
            )}
            <div className="flex flex-[1_1_340px] flex-col gap-3.5">
              <h3 className="m-0 text-[clamp(26px,3vw,32px)] font-medium leading-[1.15]">{m.title}</h3>
              <p className="m-0 text-[19px] leading-relaxed text-body">{m.body}</p>
              {m.quote && (
                <blockquote className="m-0 mt-1.5 border-l-2 border-dusty pl-[18px] text-[19px] italic leading-normal text-steel">
                  “{m.quote.replace(/^[“"]|[”"]$/g, '')}”
                </blockquote>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
