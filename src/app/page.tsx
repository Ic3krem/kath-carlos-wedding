import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings, OurStory as OurStoryData, GalleryImage } from '@/lib/types';
import { Hero } from '@/components/site/Hero';
import { Countdown } from '@/components/site/Countdown';
import { OurStory } from '@/components/site/OurStory';
import { Gallery } from '@/components/site/Gallery';
import { Entourage } from '@/components/site/Entourage';
import { VenueSchedule } from '@/components/site/VenueSchedule';
import { Logistics } from '@/components/site/Logistics';
import { GiftGuide } from '@/components/site/GiftGuide';
import { Rsvp } from '@/components/site/Rsvp';
import { Footer } from '@/components/site/Footer';
import { MusicPlayer } from '@/components/site/MusicPlayer';
import nextDynamic from 'next/dynamic';

const MagicOverlay = nextDynamic(() => import('@/components/site/MagicOverlay').then(m => m.MagicOverlay), { ssr: false });
import { SectionDivider } from '@/components/site/SectionIntro';
import {
  getEntourage,
  getGiftContent,
  getLogistics,
  getSchedule,
  getSettings,
  getStoryMilestones,
  getThemeContent,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const [
    settings,
    { data: story },
    milestones,
    entourage,
    { data: gallery },
    schedule,
    logistics,
    theme,
    gifts,
  ] = await Promise.all([
    getSettings(),
    supabase.from('our_story').select('*').eq('id', 1).single<OurStoryData>(),
    getStoryMilestones(),
    getEntourage(),
    supabase.from('gallery_images').select('*').order('sort_order'),
    getSchedule(),
    getLogistics(),
    getThemeContent(),
    getGiftContent(),
  ]);

  const resolvedSettings = settings;
  const resolvedStory = story as OurStoryData | null;

  if (!resolvedSettings || !resolvedStory) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary p-8 text-center">
        <p className="text-black/60">This site is still being set up. Please check back soon.</p>
      </main>
    );
  }

  return (
    <div data-theme={resolvedSettings.theme}>
      <MagicOverlay />
      <MusicPlayer />
      <main className="flex w-full flex-col items-center">
        <Hero settings={resolvedSettings} />

        {/* Stacking group: the countdown pins to the top of the viewport and
            the content sheet below scrolls up over it. Both share the same
            secondary background, so the countdown reads as part of the sheet. */}
        <div className="relative w-full">
          <div className="sticky top-0 z-0 w-full">
            <Countdown weddingDate={resolvedSettings.wedding_date} />
          </div>

          {/* Transparent hold: the pinned countdown shows through for another
              third of a screen, so it is read at centre before the sheet below
              starts covering it. */}
          <div aria-hidden className="h-[35svh] w-full" />

          <div className="relative z-10 flex w-full flex-col items-center bg-secondary shadow-[0_-24px_60px_rgba(0,0,0,0.12)]">
            <OurStory story={resolvedStory} milestones={milestones} />
            <SectionDivider />
            <Entourage members={entourage} />
            <SectionDivider />
            <Gallery images={(gallery as GalleryImage[]) ?? []} />
            <SectionDivider />
            <VenueSchedule settings={resolvedSettings} events={schedule} />
            <Logistics logistics={logistics} theme={theme.details} colors={theme.colors} />
            <SectionDivider />
            <GiftGuide intro={gifts.intro} options={gifts.options} />
            <Rsvp weddingDate={resolvedSettings.wedding_date} rsvpDueDate={resolvedSettings.rsvp_due_date} />
            <Footer settings={resolvedSettings} />
          </div>
        </div>
      </main>
    </div>
  );
}
