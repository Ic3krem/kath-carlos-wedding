import { cache } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type {
  Contact,
  EntourageMember,
  GiftOption,
  Logistics,
  ScheduleEvent,
  Settings,
  StoryMilestone,
  ThemeColor,
  ThemeDetails,
} from '@/lib/types';

/**
 * The settings row is needed by both generateMetadata and the page body. The
 * Supabase client deliberately runs with cache: 'no-store', so Next's fetch
 * dedup does not apply — React.cache() dedups it within a single request
 * instead, turning two round trips into one.
 */
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

// These sections became database-driven in migration 002. Until that migration
// is applied the tables don't exist, so every read falls back to the design's
// original placeholder copy rather than breaking the page.

export const THEME_FALLBACK: Omit<ThemeDetails, 'id'> = {
  headline: 'Formal / Filipiniana-inspired',
  note: 'We would love to see you in our colours. Kindly reserve white and ivory for the bride.',
  ladies_detail: 'Long dress or Filipiniana in any of the palette colours',
  gentlemen_detail: 'Barong Tagalog with black slacks, or a formal suit',
};

export const THEME_COLORS_FALLBACK: Pick<ThemeColor, 'name' | 'hex'>[] = [
  { name: 'Sage', hex: '#7C8C6B' },
  { name: 'Olive', hex: '#4F5D3A' },
  { name: 'Cream', hex: '#F2E9D8' },
  { name: 'Champagne', hex: '#D9C089' },
  { name: 'Terracotta', hex: '#B66A4A' },
];

export const GIFT_INTRO_FALLBACK =
  'Your presence on our wedding day is the greatest gift of all. But if you wish to honour us with something more, a contribution toward our new home together would mean the world.';

export const GIFT_OPTIONS_FALLBACK: Pick<GiftOption, 'title' | 'detail' | 'lines'>[] = [
  {
    title: 'Monetary Gift',
    detail: 'A gift envelope may be dropped in the wishing well at the reception.',
    lines: 'BPI • 1234-5678-90\nAccount name: Kath Santos',
  },
  { title: 'GCash', detail: 'For guests joining us from afar.', lines: '+63 917 000 0001\nKath S.' },
  { title: 'Registry', detail: 'A short list of things for our new home.', lines: 'registry.example.com/kath-carlos' },
];

export const CONTACTS_FALLBACK: Pick<Contact, 'role' | 'name' | 'phone' | 'email'>[] = [
  { role: 'Bride', name: 'Kath Santos', phone: '+63 917 000 0001', email: 'kath@example.com' },
  { role: 'Groom', name: 'Carlos Reyes', phone: '+63 917 000 0002', email: 'carlos@example.com' },
  { role: 'Wedding Coordinator', name: 'Andrea Lim', phone: '+63 917 000 0003', email: 'coordinator@example.com' },
];

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

export async function getThemeContent() {
  const [details, colors] = await Promise.all([
    safeSingle<ThemeDetails>('theme_details'),
    safeList<ThemeColor>('theme_colors'),
  ]);
  return {
    details: details ?? THEME_FALLBACK,
    colors: colors && colors.length > 0 ? colors : THEME_COLORS_FALLBACK,
  };
}

export async function getGiftContent() {
  const [intro, options] = await Promise.all([
    safeSingle<{ id: number; intro: string }>('gift_guide'),
    safeList<GiftOption>('gift_options'),
  ]);
  return {
    intro: intro?.intro || GIFT_INTRO_FALLBACK,
    options: options && options.length > 0 ? options : GIFT_OPTIONS_FALLBACK,
  };
}

/**
 * Sample entourage used until real members are added in /admin/entourage. It
 * mirrors migration 004's seed rows so the section looks the same whether or
 * not the migration has been applied. `side` picks the column: groom = left,
 * bride = right.
 */
export const ENTOURAGE_FALLBACK: Omit<EntourageMember, 'id'>[] = [
  { category: 'parents', role_label: 'Father of the Groom', name: 'Mr. Ramon A. Reyes', side: 'groom', sort_order: 0 },
  { category: 'parents', role_label: 'Mother of the Groom', name: 'Mrs. Lourdes A. Reyes', side: 'groom', sort_order: 1 },
  { category: 'parents', role_label: 'Father of the Bride', name: 'Mr. Eduardo P. Santos', side: 'bride', sort_order: 2 },
  { category: 'parents', role_label: 'Mother of the Bride', name: 'Mrs. Teresita P. Santos', side: 'bride', sort_order: 3 },

  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Roberto Dela Cruz', side: 'groom', sort_order: 10 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Manuel Aguilar', side: 'groom', sort_order: 11 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Rodrigo Villanueva', side: 'groom', sort_order: 12 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Mario Bautista', side: 'groom', sort_order: 13 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Wilfredo Navarro', side: 'groom', sort_order: 14 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Joel Marquez', side: 'groom', sort_order: 15 },
  { category: 'godparents', role_label: 'Ninong', name: 'Mr. Aries Salvador', side: 'groom', sort_order: 16 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Rochelle Dela Cruz', side: 'bride', sort_order: 17 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Joana Aguilar', side: 'bride', sort_order: 18 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Maria Teresa Villanueva', side: 'bride', sort_order: 19 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Evangeline Bautista', side: 'bride', sort_order: 20 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Regina Navarro', side: 'bride', sort_order: 21 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Guia Marquez', side: 'bride', sort_order: 22 },
  { category: 'godparents', role_label: 'Ninang', name: 'Mrs. Vina Salvador', side: 'bride', sort_order: 23 },

  { category: 'best_man', role_label: 'Best Man', name: 'Mr. Miguel A. Reyes', side: null, sort_order: 30 },
  { category: 'maid_of_honor', role_label: 'Maid of Honor', name: 'Ms. Patricia S. Santos', side: null, sort_order: 31 },

  { category: 'groomsmen', role_label: 'Groomsman', name: 'Mr. Julian Cruz', side: 'groom', sort_order: 40 },
  { category: 'groomsmen', role_label: 'Groomsman', name: 'Mr. Francis Dizon', side: 'groom', sort_order: 41 },
  { category: 'groomsmen', role_label: 'Groomsman', name: 'Mr. Christian Ilagan', side: 'groom', sort_order: 42 },
  { category: 'bridesmaids', role_label: 'Bridesmaid', name: 'Ms. Rhea Calma', side: 'bride', sort_order: 43 },
  { category: 'bridesmaids', role_label: 'Bridesmaid', name: 'Ms. Denise Fajardo', side: 'bride', sort_order: 44 },
  { category: 'bridesmaids', role_label: 'Bridesmaid', name: 'Ms. Abigail Manalo', side: 'bride', sort_order: 45 },

  { category: 'ring_bearer', role_label: 'Ring Bearer', name: 'Stephen Miguel Lopez', side: 'groom', sort_order: 50 },
  { category: 'bible_bearer', role_label: 'Bible Bearer', name: 'Nathan Brielle Lim', side: 'groom', sort_order: 51 },
  { category: 'coin_bearer', role_label: 'Coin Bearer', name: 'Jacob Reyes', side: 'groom', sort_order: 52 },
  { category: 'coin_bearer', role_label: 'Coin Bearer', name: 'Caleb Christopher Reyes', side: 'groom', sort_order: 53 },

  { category: 'flower_girls', role_label: 'Flower Girl', name: 'Sofia Reyes', side: 'bride', sort_order: 60 },
  { category: 'flower_girls', role_label: 'Flower Girl', name: 'Faith Santos', side: 'bride', sort_order: 61 },
  { category: 'flower_girls', role_label: 'Flower Girl', name: 'Ayah Cruz', side: 'bride', sort_order: 62 },
  { category: 'flower_girls', role_label: 'Flower Girl', name: 'Daniella Lim', side: 'bride', sort_order: 63 },
  { category: 'flower_girls', role_label: 'Flower Girl', name: 'Jasmine Tolentino', side: 'bride', sort_order: 64 },
];

export async function getEntourage(): Promise<Omit<EntourageMember, 'id'>[]> {
  const members = await safeList<EntourageMember>('entourage_members');
  return members && members.length > 0 ? members : ENTOURAGE_FALLBACK;
}

/** Mirrors migration 006's seed rows, for before the migration is applied. */
export const MILESTONES_FALLBACK: Omit<StoryMilestone, 'id'>[] = [
  {
    era: 'Autumn 2019',
    place: 'Angeles City, Pampanga',
    title: 'A Rainy Afternoon on Fields Avenue',
    body: 'We took shelter under the same awning during a sudden October downpour. One shared table, two cups of barako, and three hours of talking about old films and older songs — and the compass was set.',
    quote: 'We knew within minutes that we had met the person we had been looking for all along.',
    image_url: null,
    caption: 'Where it started — Autumn 2019',
    sort_order: 0,
  },
  {
    era: 'Summer 2021',
    place: 'Mariveles, Bataan',
    title: 'Sunrise at the Foot of Mt. Tarak',
    body: 'We climbed before dawn and watched the bay turn gold from the ridge. Somewhere between the coffee and the long walk down, we promised each other that whatever came next, we would take it together.',
    quote: 'The mountain gave us our first real quiet — and we have been chasing it ever since.',
    image_url: null,
    caption: 'Mt. Tarak ridge — Summer 2021',
    sort_order: 1,
  },
  {
    era: 'Winter 2024',
    place: 'Alasasin, Bataan',
    title: 'A Question by the Water',
    body: 'On the shore below the church where we will marry, with family hiding badly behind the trees, the question was asked. It was answered before it was finished.',
    quote: 'A quiet promise by the water, and the beginning of everything after.',
    image_url: null,
    caption: 'Alasasin shore — December 2024',
    sort_order: 2,
  },
];

export const SCHEDULE_FALLBACK: Omit<ScheduleEvent, 'id'>[] = [
  {
    day_label: 'Day I',
    date_label: 'Friday',
    title: 'Welcome Merienda',
    time_label: '4:00 PM - 8:00 PM',
    body: 'Join us at Mt. Tarak Guest House for pancit, lechon kawali and cold drinks as everyone arrives. No programme, no seating chart — just the first hellos.',
    attire: 'Smart casual',
    agenda: '',
    is_highlight: false,
    sort_order: 0,
  },
  {
    day_label: 'Day II',
    date_label: 'Saturday',
    title: 'The Wedding Day',
    time_label: '',
    body: '',
    attire: 'Formal / Filipiniana-inspired',
    agenda: [
      '2:00 PM|Guests seated - Alasasin Church of Christ',
      '3:00 PM|Ceremony',
      '5:00 PM|Cocktails and photos - Mt. Tarak garden',
      '6:30 PM|Dinner and programme',
      '9:00 PM|Dancing until the lights go out',
    ].join('\n'),
    is_highlight: true,
    sort_order: 1,
  },
  {
    day_label: 'Day III',
    date_label: 'Sunday',
    title: 'Send-off Breakfast',
    time_label: '8:00 AM - 11:00 AM',
    body: 'Silog, fresh pandesal and coffee by the garden before everyone heads home. Come as late as you like.',
    attire: 'However you woke up',
    agenda: '',
    is_highlight: false,
    sort_order: 2,
  },
];

export const LOGISTICS_FALLBACK: Omit<Logistics, 'id'> = {
  dress_note:
    'We are keeping it formal with a Filipiniana heart. Barong or a dark suit for the gentlemen; a long dress or a modern terno for the ladies. Kindly leave white and ivory to the bride.',
  stay_title: 'Where to Stay',
  stay_body:
    'Rooms are held at Mt. Tarak Guest House and at the inns along Alasasin Road under the name CAYANAN-LIM. Please book before the 1st of the month prior — the town fills up on weekends.',
  travel_title: 'Getting There',
  travel_body:
    'Mariveles is roughly three hours from Manila via NLEX and the Roman Highway, or by ferry from Manila to Orion and a short drive down. Shuttles will run between the guest house and the church before and after the ceremony.',
};

export async function getStoryMilestones(): Promise<Omit<StoryMilestone, 'id'>[]> {
  const rows = await safeList<StoryMilestone>('story_milestones');
  return rows && rows.length > 0 ? rows : MILESTONES_FALLBACK;
}

export async function getSchedule(): Promise<Omit<ScheduleEvent, 'id'>[]> {
  const rows = await safeList<ScheduleEvent>('schedule_events');
  return rows && rows.length > 0 ? rows : SCHEDULE_FALLBACK;
}

export async function getLogistics(): Promise<Omit<Logistics, 'id'>> {
  return (await safeSingle<Logistics>('logistics')) ?? LOGISTICS_FALLBACK;
}

export async function getContacts() {
  const contacts = await safeList<Contact>('contacts');
  return contacts && contacts.length > 0 ? contacts : CONTACTS_FALLBACK;
}
