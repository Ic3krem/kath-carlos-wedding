import { z } from 'zod';

export const rsvpSchema = z.object({
  /** Must match a name on the invite list (/admin/invites). */
  name: z.string().trim().min(1, 'Name is required').max(200),
  attending: z.boolean(),
  /** Full names of the companions coming along; ignored when not attending. */
  companions: z.array(z.string().trim().min(1, 'Companion name is required').max(200)).max(20).default([]),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
