import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  attending: z.boolean(),
  guest_count: z.number().int().min(1).max(20),
  /** Who they're bringing — needed for seating and place cards. */
  guest_names: z.string().max(500).optional().nullable(),
  meal_preference: z.string().max(200).optional().nullable(),
  /** Allergies and dietary needs for the whole party. */
  allergies: z.string().max(500).optional().nullable(),
  song_request: z.string().max(200).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
