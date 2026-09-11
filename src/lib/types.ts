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
  title: string;
  excerpt: string;
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

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  attending: boolean;
  guest_count: number;
  meal_preference: string | null;
  message: string | null;
  created_at: string;
}
