import Image from 'next/image';
import type { StoryMilestone } from '@/lib/types';
import { Decor } from './Decor';
import { Reveal } from './Reveal';
import { Tilt } from './Tilt';
import { SectionHeading } from './SectionHeading';

export function OurStory({ milestones }: { milestones: Omit<StoryMilestone, 'id'>[] }) {
  return (
    <section id="story" className="relative isolate overflow-hidden bg-paper px-6 py-[88px]">
      <Decor />
      <Reveal>
        <SectionHeading eyebrow="Our Story" title="How Our Journey Began" />
      </Reveal>
      <div className="mx-auto mt-12 flex max-w-[1000px] flex-col gap-[72px]">
        {milestones.map((m, i) => (
          <div
            key={`${m.title}-${i}`}
            className={`flex flex-wrap items-center gap-12 ${i % 2 === 1 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {m.image_url && (
              <Reveal from={i % 2 === 1 ? 'right' : 'left'} className="flex-[1_1_340px]">
                <figure className="m-0 flex flex-col items-center gap-3">
                  <Tilt className="w-full rounded-xl" max={6}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-photo">
                      <Image
                        src={m.image_url}
                        alt={m.caption || m.title}
                        fill
                        sizes="(min-width: 1024px) 480px, 92vw"
                        quality={78}
                        className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                      />
                    </div>
                  </Tilt>
                </figure>
              </Reveal>
            )}
            <Reveal from={i % 2 === 1 ? 'left' : 'right'} delay={150} className="flex flex-[1_1_340px] flex-col gap-3.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-label">
                Chapter {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="m-0 text-[clamp(26px,3vw,32px)] font-medium leading-[1.15]">{m.title}</h3>
              <p className="m-0 text-[19px] leading-relaxed text-body">{m.body}</p>
              {m.quote && (
                <blockquote className="m-0 mt-1.5 border-l-2 border-dusty pl-[18px] text-[19px] italic leading-normal text-steel">
                  “{m.quote.replace(/^[“"]|[”"]$/g, '')}”
                </blockquote>
              )}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
