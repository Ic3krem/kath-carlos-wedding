import * as React from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type {
  EntourageMember,
  GalleryImage,
  GiftOption,
  InviteAllocation,
  Settings,
  StoryMilestone,
  ThemeColor,
  ThemeDetails,
  TimelineItem,
} from '@/lib/types';

/**
 * The settings row is needed by both generateMetadata and the page body. The
 * Supabase client deliberately runs with cache: 'no-store', so Next's fetch
 * dedup does not apply — React.cache() dedups it within a single request
 * instead, turning two round trips into one.
 */
const cache: typeof React.cache = React.cache ?? ((fn) => fn); // plain function outside a React server (tests)

export const getSettings = cache(async (): Promise<Settings | null> => {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single<Settings>();
    return error ? null : data;
  } catch {
    return null;
  }
});

// Every section reads its table defensively: until a migration is applied (or
// before the couple has entered anything in /admin) the page falls back to
// the design's own copy rather than breaking.

async function safeSingle<T>(table: string): Promise<T | null> {
  try {
    const { data, error } = await getSupabaseServerClient().from(table).select('*').eq('id', 1).single<T>();
    return error ? null : data;
  } catch {
    return null;
  }
}

async function safeList<T>(table: string): Promise<T[] | null> {
  try {
    const { data, error } = await getSupabaseServerClient().from(table).select('*').order('sort_order');
    return error ? null : ((data as T[]) ?? []);
  } catch {
    return null;
  }
}

// --- Settings -------------------------------------------------------------

export const SETTINGS_FALLBACK: Settings = {
  id: 1,
  couple_names: 'Carlos & Kath',
  wedding_date: '2026-11-28T07:00:00.000Z', // 3:00 PM in Manila
  hero_image_url: null,
  theme: 'dusty-blue',
  maps_address: null,
  maps_embed_url: null,
  ceremony_name: 'Alasasin Church of Christ',
  ceremony_address: 'Alasasin, Mariveles, Bataan',
  ceremony_embed_url: null,
  reception_name: 'Mt. Tarak Guest House and Restaurant',
  reception_address: 'Alasasin, Mariveles, Bataan',
  reception_embed_url: null,
  rsvp_due_date: '2026-10-30T15:59:00.000Z',
  hero_message:
    "By God's grace, and surrounded by your love, we, together with our families, invite you to celebrate our marriage.",
  ceremony_directions: '',
  reception_directions: '',
  timeline_note:
    'We will start the program promptly on the scheduled timeline, so we kindly ask that we arrive on time at each part of the celebration — your punctuality is greatly appreciated.',
};

export const DIRECTIONS_FALLBACK = [
  'Mariveles is roughly three hours from Manila via NLEX and the Roman Highway, or by ferry from Manila to Orion and a short drive down.',
  'Shuttles will run between the guest house and the church before and after the ceremony.',
];

/** The stored settings with every empty field filled from the fallback. */
export function withSettingsDefaults(settings: Settings | null): Settings {
  if (!settings) return SETTINGS_FALLBACK;
  const merged = { ...SETTINGS_FALLBACK } as Record<string, unknown>;
  for (const [key, value] of Object.entries(settings)) {
    if (value !== null && value !== undefined && value !== '') merged[key] = value;
  }
  return merged as unknown as Settings;
}

// --- Our Story ------------------------------------------------------------

export const MILESTONES_FALLBACK: Omit<StoryMilestone, 'id'>[] = [
  {
    era: '2019',
    place: 'Mariveles, Bataan',
    title: 'From NearGroup to Forever',
    body: 'We took shelter under the same awning during a sudden October downpour. One shared table, two cups of barako, and three hours of talking about old films and older songs — and the compass was set.',
    quote: 'We knew within minutes that we had met the person we had been looking for all along.',
    image_url: '/story/story1.webp',
    caption: 'Where it started — Alasasin 2019',
    sort_order: 0,
  },
  {
    era: 'Summer 2021',
    place: 'Romalaines, Mariveles',
    title: 'March 10, 2021: Our Official Beginning',
    body: 'We climbed before dawn and watched the bay turn gold from the ridge. Somewhere between the coffee and the long walk down, we promised each other that whatever came next, we would take it together.',
    quote: 'The mountain gave us our first real quiet — and we have been chasing it ever since.',
    image_url: '/story/story2.webp',
    caption: 'Romalaines — Summer 2021',
    sort_order: 1,
  },
  {
    era: 'December 2025',
    place: 'Balanga, Bataan',
    title: 'The Day She Said Yes to Forever',
    body: 'On the shore below the church where we will marry, with family hiding badly behind the trees, the question was asked. It was answered before it was finished.',
    quote: 'A quiet promise by the water, and the beginning of everything after.',
    image_url: '/story/story3.webp',
    caption: 'One Question, One Answer, Forever — December 2025',
    sort_order: 2,
  },
];

export async function getStoryMilestones(): Promise<Omit<StoryMilestone, 'id'>[]> {
  const rows = await safeList<StoryMilestone>('story_milestones');
  return rows && rows.length > 0 ? rows : MILESTONES_FALLBACK;
}

// --- Entourage ------------------------------------------------------------

type Seed = [EntourageMember['category'], string, string, EntourageMember['side']];

const ENTOURAGE_SEED: Seed[] = [
  ['parents', 'Father of the Groom', 'Mr. Nestor Diaz', 'groom'],
  ['parents', 'Mother of the Groom', 'Mrs. Ma. Criste Diaz', 'groom'],
  ['parents', 'Father of the Bride', 'Mr. Orlando Gloria', 'bride'],
  ['parents', 'Mother of the Bride', 'Mrs. Laura Gloria', 'bride'],
  ['officiant', 'Officiant Pastor', 'Ptr. Rodel Reyes', null],
  ...[
    'Mr. Dennis Velasco',
    'Mr. Crisanto Salvador',
    'Hon. Florante Malimban',
    'Mr. Larry Gloria',
    'Mr. Rene Torres',
    'Mr. Alvin Cervantes',
    'Mr. Sherwin Punzalan',
    'Mr. Joven Gloria',
  ].map((name): Seed => ['godparents', 'Ninong', name, 'groom']),
  ...[
    'Mrs. Marites Velches',
    'Mrs. Gina Zalavaria',
    'Mrs. Josa Diwata',
    'Mrs. Vilma Cioco',
    'Mrs. Michelle Binajbaj',
    'Mrs. Guada Buena',
    'Mrs. Carolyn Reyes',
    'Mrs. Cherry Ann Inocencio',
  ].map((name): Seed => ['godparents', 'Ninang', name, 'bride']),
  ['maid_of_honor', 'Maid of Honor', 'Ms. Demi Francheska Gloria', null],
  ['best_man', 'Best Man', 'Mr. John Cedrik Diaz', null],
  ['best_man', 'Best Man', 'Mr. John Christopher Diaz', null],
  ...(
    [
      ['To clothe us as One', 'Karlo Macagba', 'Kesia Jamel Corton'],
      ['To bind us together', 'Jhontrix Catorce', 'Casielyn Marquez'],
      ['To light our path', 'Kristian Abines', 'Aira Mariz Delfinado'],
      ['To Remove the Veil', 'Rhobert Medilo', 'Cynthialyn Toledo'],
      ['To Remain the Cord', 'Angelo Salayog', 'Recelyn Licaroz'],
    ] as const
  ).flatMap(([role, m, f]): Seed[] => [
    ['ceremony_sponsors', role, m, 'groom'],
    ['ceremony_sponsors', role, f, 'bride'],
  ]),
  ['ring_bearer', 'Ring Bearer', 'Zane Ekon Delfinado', null],
  ['coin_bearer', 'Coin Bearer', 'Gavin Rhylle O. Medilo', null],
  ['bible_bearer', 'Bible Bearer', 'David Asher Malabanan', null],
  ...[
    'Christine Abines',
    'Ariella Reyes',
    'Fiona Reyes',
    'Sofia Mac Escario',
    'Desiree Ann Abines',
    'Ilya Nikolai Gloria',
    'Avianna Maxine Toledo',
  ].map((name): Seed => ['flower_girls', 'Flower Girl', name, 'bride']),
];

/** Used until real members are added in /admin/entourage. */
export const ENTOURAGE_FALLBACK: Omit<EntourageMember, 'id'>[] = ENTOURAGE_SEED.map(
  ([category, role_label, name, side], i) => ({ category, role_label, name, side, sort_order: i }),
);

export async function getEntourage(): Promise<Omit<EntourageMember, 'id'>[]> {
  const members = await safeList<EntourageMember>('entourage_members');
  return members && members.length > 0 ? members : ENTOURAGE_FALLBACK;
}

// --- Timeline -------------------------------------------------------------

export const TIMELINE_FALLBACK: Omit<TimelineItem, 'id'>[] = [
  { time_label: '2:00 PM', label: 'Assembly', icon: 'people', sort_order: 0 },
  { time_label: '3:00 PM', label: 'Wedding Ceremony', icon: 'church', sort_order: 1 },
  { time_label: '5:00 PM', label: 'Pica-Pica and Photoshoot', icon: 'camera', sort_order: 2 },
  { time_label: '6:00 PM', label: 'Reception', icon: 'dining', sort_order: 3 },
  { time_label: '9:00 PM', label: 'End of Program and Send-Off', icon: 'heart', sort_order: 4 },
];

export async function getTimeline(): Promise<Omit<TimelineItem, 'id'>[]> {
  const rows = await safeList<TimelineItem>('timeline_items');
  return rows && rows.length > 0 ? rows : TIMELINE_FALLBACK;
}

// --- Gallery --------------------------------------------------------------

export const GALLERY_FALLBACK: Omit<GalleryImage, 'id'>[] = Array.from({ length: 12 }, (_, i) => ({
  image_url: `/gallery/gallery${i + 1}.webp`,
  caption: null,
  sort_order: i,
}));

export async function getGallery(): Promise<Omit<GalleryImage, 'id'>[]> {
  const rows = await safeList<GalleryImage>('gallery_images');
  return rows && rows.length > 0 ? rows : GALLERY_FALLBACK;
}

// --- Attire guide ---------------------------------------------------------

export const THEME_FALLBACK: Omit<ThemeDetails, 'id'> = {
  headline: '',
  note: 'A guide, not a uniform — anything in these colours is perfect.',
  ladies_detail: '',
  gentlemen_detail: '',
  life_godparents_detail: 'Wedding colours',
  godparents_gentlemen_detail: 'Black suit, pants, tie',
  godparents_ladies_detail: 'Formal gown in the wedding colours',
  guest_note: '',
  avoid_note: 'Please refrain from wearing white, denim, and slippers.',
  comfort_note:
    'Most importantly, wear something you feel comfortable and confident in while complementing on our wedding theme.',
};

export const THEME_COLORS_FALLBACK: Pick<ThemeColor, 'name' | 'hex'>[] = [
  { name: 'Mist', hex: '#d7e0e8' },
  { name: 'Dusty Blue', hex: '#8aa4bb' },
  { name: 'Steel Blue', hex: '#5b7c9c' },
  { name: 'Deep Navy', hex: '#2a3f5c' },
];

export async function getThemeContent() {
  const [details, colors] = await Promise.all([
    safeSingle<ThemeDetails>('theme_details'),
    safeList<ThemeColor>('theme_colors'),
  ]);
  const merged = { ...THEME_FALLBACK } as Record<string, unknown>;
  for (const [key, value] of Object.entries(details ?? {})) {
    if (value !== null && value !== undefined && value !== '') merged[key] = value;
  }
  return {
    details: merged as unknown as Omit<ThemeDetails, 'id'>,
    colors: colors && colors.length > 0 ? colors : THEME_COLORS_FALLBACK,
  };
}

// --- Gift guide -----------------------------------------------------------

export const GIFT_INTRO_FALLBACK =
  'Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, a monetary contribution toward our future together would be sincerely appreciated. To assist you, money envelopes will be provided at the reception.';

export async function getGiftContent() {
  const [intro, options] = await Promise.all([
    safeSingle<{ id: number; intro: string }>('gift_guide'),
    safeList<GiftOption>('gift_options'),
  ]);
  return { intro: intro?.intro || GIFT_INTRO_FALLBACK, options: options ?? [] };
}

// --- RSVP -----------------------------------------------------------------

/**
 * The guest list the RSVP form matches names against. Filled in via
 * /admin/invites — only names on it can RSVP.
 */
export async function getInviteAllocations(): Promise<InviteAllocation[]> {
  return (await safeList<InviteAllocation>('invite_allocations')) ?? [];
}
