import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings, OurStory as OurStoryData, EntourageMember, GalleryImage } from '@/lib/types';
import { RsvpModalProvider } from '@/lib/rsvp-modal-context';
import { RsvpModal } from '@/components/site/RsvpModal';
import { Hero } from '@/components/site/Hero';
import { Countdown } from '@/components/site/Countdown';
import { OurStory } from '@/components/site/OurStory';
import { Gallery } from '@/components/site/Gallery';
import { Entourage } from '@/components/site/Entourage';
import { MapEmbed } from '@/components/site/MapEmbed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const [{ data: settings }, { data: story }, { data: entourage }, { data: gallery }] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).single<Settings>(),
    supabase.from('our_story').select('*').eq('id', 1).single<OurStoryData>(),
    supabase.from('entourage_members').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
  ]);

  const resolvedSettings = settings as Settings;

  return (
    <div data-theme={resolvedSettings.theme}>
      <RsvpModalProvider>
        <main className="flex w-full flex-col items-center">
          <Hero settings={resolvedSettings} />
          <Countdown weddingDate={resolvedSettings.wedding_date} />
          <OurStory story={story as OurStoryData} />
          <Gallery images={(gallery as GalleryImage[]) ?? []} />
          <Entourage members={(entourage as EntourageMember[]) ?? []} />
          <MapEmbed address={resolvedSettings.maps_address} embedUrl={resolvedSettings.maps_embed_url} />
        </main>
        <RsvpModal />
      </RsvpModalProvider>
    </div>
  );
}
