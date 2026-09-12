import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Contact, GiftOption, ThemeColor, ThemeDetails } from '@/lib/types';

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

export async function getContacts() {
  const contacts = await safeList<Contact>('contacts');
  return contacts && contacts.length > 0 ? contacts : CONTACTS_FALLBACK;
}
