import { Hero } from '@/components/site/Hero';
import { Countdown } from '@/components/site/Countdown';
import { OurStory } from '@/components/site/OurStory';
import { Entourage } from '@/components/site/Entourage';
import { Details, type Venue } from '@/components/site/Details';
import { Gallery } from '@/components/site/Gallery';
import { AttireGuide } from '@/components/site/AttireGuide';
import { GiftGuide } from '@/components/site/GiftGuide';
import { Rsvp } from '@/components/site/Rsvp';
import { Footer } from '@/components/site/Footer';
import { MusicPlayer } from '@/components/site/MusicPlayer';
import { ScrollEffects } from '@/components/site/ScrollEffects';
import { Florals } from '@/components/site/Florals';
import { LightOrbs } from '@/components/site/LightOrbs';
import { FloralIntro } from '@/components/site/FloralIntro';
import nextDynamic from 'next/dynamic';
import {
  DIRECTIONS_FALLBACK,
  getEntourage,
  getGallery,
  getGiftContent,
  getSettings,
  getStoryMilestones,
  getThemeContent,
  getTimeline,
  withSettingsDefaults,
} from '@/lib/content';
import { formatLongDate, formatTime, formatWeekday } from '@/lib/date-utils';

// Served from cache; admin saves refresh it at once (lib/cache.ts).
export const revalidate = 300;

// Canvas-only effect, so it never needs server rendering.
const MagicOverlay = nextDynamic(() => import('@/components/site/MagicOverlay').then((m) => m.MagicOverlay), {
  ssr: false,
});

function venue(kind: Venue['kind'], name: string | null, address: string | null, embed: string | null, directions?: string): Venue {
  const query = [name, address].filter(Boolean).join(', ');
  const steps = (directions ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    kind,
    name: name ?? '',
    address: address ?? '',
    embedUrl: embed || `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    steps: steps.length > 0 ? steps : DIRECTIONS_FALLBACK,
  };
}

export default async function HomePage() {
  const [stored, milestones, entourage, timeline, gallery, theme, gifts] = await Promise.all([
    getSettings(),
    getStoryMilestones(),
    getEntourage(),
    getTimeline(),
    getGallery(),
    getThemeContent(),
    getGiftContent(),
  ]);

  const settings = withSettingsDefaults(stored);
  const dateLabel = formatLongDate(settings.wedding_date);
  const venues = [
    venue('Ceremony', settings.ceremony_name, settings.ceremony_address, settings.ceremony_embed_url, settings.ceremony_directions),
    venue('Reception', settings.reception_name, settings.reception_address, settings.reception_embed_url, settings.reception_directions),
  ];

  return (
    <main className="bg-paper font-serif text-ink">
      <MagicOverlay />
      <MusicPlayer />
      <ScrollEffects />
      <FloralIntro coupleNames={settings.couple_names} />
      <LightOrbs />
      <Florals />
      <Hero settings={settings} />
      <Countdown weddingDate={settings.wedding_date} message={settings.hero_message} />
      <OurStory milestones={milestones} />
      <Entourage members={entourage} />
      <Details
        dateLabel={dateLabel}
        weekday={formatWeekday(settings.wedding_date)}
        time={formatTime(settings.wedding_date)}
        venues={venues}
        timeline={timeline}
        timelineNote={settings.timeline_note ?? ''}
      />
      <Gallery images={gallery} />
      <AttireGuide details={theme.details} colors={theme.colors} />
      <GiftGuide intro={gifts.intro} options={gifts.options} />
      <Rsvp
        coupleNames={settings.couple_names}
        dateLabel={dateLabel}
        dueLabel={settings.rsvp_due_date ? formatLongDate(settings.rsvp_due_date) : null}
      />
      <Footer settings={settings} />
    </main>
  );
}
