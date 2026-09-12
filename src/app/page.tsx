import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings, OurStory as OurStoryData, EntourageMember, GalleryImage } from '@/lib/types';
import { RsvpModalProvider } from '@/lib/rsvp-modal-context';
import { RsvpModal } from '@/components/site/RsvpModalLazy';
import { Hero } from '@/components/site/Hero';
import { Countdown } from '@/components/site/Countdown';
import { OurStory } from '@/components/site/OurStory';
import { Gallery } from '@/components/site/Gallery';
import { Entourage } from '@/components/site/Entourage';
import { MapEmbed } from '@/components/site/MapEmbed';
import { Theme } from '@/components/site/Theme';
import { GiftGuide } from '@/components/site/GiftGuide';
import { Rsvp } from '@/components/site/Rsvp';
import { Footer } from '@/components/site/Footer';
import { getContacts, getGiftContent, getSettings, getThemeContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const [settings, { data: story }, { data: entourage }, { data: gallery }, theme, gifts, contacts] =
    await Promise.all([
      getSettings(),
      supabase.from('our_story').select('*').eq('id', 1).single<OurStoryData>(),
      supabase.from('entourage_members').select('*').order('sort_order'),
      supabase.from('gallery_images').select('*').order('sort_order'),
      getThemeContent(),
      getGiftContent(),
      getContacts(),
    ]);

  const resolvedSettings = settings;
  const resolvedStory = story as OurStoryData | null;

  if (!resolvedSettings || !resolvedStory) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        <p className="text-black/60">This site is still being set up. Please check back soon.</p>
      </main>
    );
  }

  return (
    <div data-theme={resolvedSettings.theme}>
      <RsvpModalProvider>
        <main className="flex w-full flex-col items-center">
          <Hero settings={resolvedSettings} />
          <Countdown weddingDate={resolvedSettings.wedding_date} />
          <OurStory story={resolvedStory} />
          <Gallery images={(gallery as GalleryImage[]) ?? []} />
          <Entourage members={(entourage as EntourageMember[]) ?? []} />
          <Theme details={theme.details} colors={theme.colors} />
          <MapEmbed address={resolvedSettings.maps_address} embedUrl={resolvedSettings.maps_embed_url} />
          <GiftGuide intro={gifts.intro} options={gifts.options} />
          <Rsvp weddingDate={resolvedSettings.wedding_date} />
          <Footer settings={resolvedSettings} contacts={contacts} />
        </main>
        <RsvpModal />
      </RsvpModalProvider>
    </div>
  );
}
