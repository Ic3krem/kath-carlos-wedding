import { z } from 'zod';

export const rsvpSchema = z
  .object({
    /** Must match a name on the invite list (/admin/invites). */
    name: z.string().trim().min(1, 'Name is required').max(200),
    /** 'proxy': the invitee can't come but sends someone in their place. */
    response: z.enum(['yes', 'no', 'proxy']),
    /** Full names of the companions coming along; ignored when declining. */
    companions: z.array(z.string().trim().min(1, 'Companion name is required').max(200)).max(20).default([]),
    proxyName: z.string().trim().max(200).optional(),
    /** Optional: where to send the guest's own copy of their RSVP. */
    email: z
      .union([z.literal(''), z.string().trim().toLowerCase().email('Please check your email address.').max(200)])
      .optional(),
  })
  .refine((v) => v.response !== 'proxy' || (v.proxyName ?? '').length > 0, {
    message: 'Please enter the name of the person attending on your behalf.',
    path: ['proxyName'],
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;
