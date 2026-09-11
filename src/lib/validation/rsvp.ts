import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('A valid email is required'),
  phone: z.string().max(50).optional().nullable(),
  attending: z.boolean(),
  guest_count: z.number().int().min(1).max(20),
  meal_preference: z.string().max(200).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
