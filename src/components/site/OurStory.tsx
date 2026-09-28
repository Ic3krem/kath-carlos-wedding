import Image from 'next/image';
import type { StoryMilestone } from '@/lib/types';
import { Decor } from './Decor';
import { Reveal } from './Reveal';
import { StoryText } from './StoryText';
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
        {milestones.map((m, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={`${m.title}-${i}`} className="grid items-stretch gap-8 md:grid-cols-2 md:gap-12">
              {m.image_url && (
                <Reveal from={flip ? 'right' : 'left'} className={flip ? 'md:order-2' : ''}>
                  <figure className="m-0">
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
              {/* Stretches to the photo's height; the text inside never makes the row taller. */}
              <Reveal from={flip ? 'left' : 'right'} delay={150} className={`relative ${flip ? 'md:order-1' : ''}`}>
                <StoryText milestone={m} chapter={i + 1} />
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
