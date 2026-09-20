export interface Settings {
  id: number;
  couple_names: string;
  wedding_date: string;
  hero_image_url: string | null;
  theme: string;
  /** Legacy single-venue fields; used as the ceremony fallback. */
  maps_address: string | null;
  maps_embed_url: string | null;
  ceremony_name: string | null;
  ceremony_address: string | null;
  ceremony_embed_url: string | null;
  reception_name: string | null;
  reception_address: string | null;
  reception_embed_url: string | null;
  rsvp_due_date: string | null;
  hero_message: string;
}

export interface OurStory {
  id: number;
  image_url: string | null;
  image_url_2: string | null;
  title: string;
  excerpt: string;
  excerpt_2: string;
  full_story: string;
  button_label: string;
}

export type EntourageCategory =
  | 'parents'
  | 'godparents'
  | 'best_man'
  | 'maid_of_honor'
  | 'groomsmen'
  | 'bridesmaids'
  | 'flower_girls'
  | 'ring_bearer'
  | 'coin_bearer'
  | 'bible_bearer'
  | 'ceremony_sponsors'
  | 'other';

export const ENTOURAGE_CATEGORIES: EntourageCategory[] = [
  'parents',
  'godparents',
  'best_man',
  'maid_of_honor',
  'groomsmen',
  'bridesmaids',
  'flower_girls',
  'ring_bearer',
  'coin_bearer',
  'bible_bearer',
  'ceremony_sponsors',
  'other',
];

/** Heading shown above each group on the public page. */
export const ENTOURAGE_CATEGORY_LABELS: Record<EntourageCategory, string> = {
  parents: 'Parents',
  godparents: 'Life Godparents',
  best_man: "Groom's Bests",
  maid_of_honor: "Bride's Best",
  groomsmen: 'Groomsmen',
  bridesmaids: 'Bridesmaids',
  flower_girls: 'Flower Girls',
  ring_bearer: 'Ring Bearer',
  coin_bearer: 'Coin Bearer',
  bible_bearer: 'Bible Bearer',
  ceremony_sponsors: 'Ceremony Sponsors',
  other: 'Entourage',
};

/**
 * The three candle/veil/cord roles, added per the client's revision. Each is
 * shown as a Mr.-and-Ms. pair ("magkasama"); `role_label` on the member row
 * holds one of these titles so the public page can group pairs under it.
 */
export const CEREMONY_SPONSOR_TITLES = [
  'To Light Our Path',
  'To Clothe Us as One',
  'To Bind Us Together',
] as const;
export type EntourageSide = 'bride' | 'groom' | null;

export interface EntourageMember {
  id: string;
  category: EntourageCategory;
  role_label: string;
  name: string;
  side: EntourageSide;
  sort_order: number;
}

export interface StoryMilestone {
  id: string;
  era: string;
  place: string;
  title: string;
  body: string;
  quote: string;
  image_url: string | null;
  caption: string;
  sort_order: number;
}

export interface ScheduleEvent {
  id: string;
  day_label: string;
  date_label: string;
  title: string;
  time_label: string;
  body: string;
  attire: string;
  /** newline-separated "time|what" rows; replaces `body` when present */
  agenda: string;
  is_highlight: boolean;
  sort_order: number;
}

export interface Logistics {
  id: number;
  dress_note: string;
  stay_title: string;
  stay_body: string;
  travel_title: string;
  travel_body: string;
}

export type GalleryShape = 'square' | 'tall' | 'wide' | null;

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  shape?: GalleryShape;
}

export interface ThemeDetails {
  id: number;
  headline: string;
  note: string;
  /** Guests' attire (the general "dress in our colours" guidance). */
  ladies_detail: string;
  gentlemen_detail: string;
  /** Godparents'/entourage's attire, which is stricter than the general guest guidance. */
  godparents_ladies_detail: string;
  godparents_gentlemen_detail: string;
  guest_note: string;
  avoid_note: string;
  comfort_note: string;
}

export interface ThemeColor {
  id: string;
  name: string;
  hex: string;
  sort_order: number;
}

export interface GiftGuideIntro {
  id: number;
  intro: string;
}

export interface GiftOption {
  id: string;
  title: string;
  detail: string;
  /** newline-separated */
  lines: string;
  sort_order: number;
}

export interface Contact {
  id: string;
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  sort_order: number;
}

export interface InviteAllocation {
  id: string;
  name: string;
  max_guests: number;
  sort_order: number;
}

export interface Rsvp {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  attending: boolean;
  guest_count: number;
  guest_names: string | null;
  meal_preference: string | null;
  allergies: string | null;
  song_request: string | null;
  message: string | null;
  created_at: string;
}
