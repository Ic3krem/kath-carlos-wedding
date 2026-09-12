export interface Settings {
  id: number;
  couple_names: string;
  wedding_date: string;
  hero_image_url: string | null;
  theme: string;
  maps_address: string | null;
  maps_embed_url: string | null;
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

export type EntourageCategory = 'parents' | 'godparents' | 'other';
export type EntourageSide = 'bride' | 'groom' | null;

export interface EntourageMember {
  id: string;
  category: EntourageCategory;
  role_label: string;
  name: string;
  side: EntourageSide;
  sort_order: number;
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
  ladies_detail: string;
  gentlemen_detail: string;
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

export interface Rsvp {
  id: string;
  name: string;
  email: string;
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
