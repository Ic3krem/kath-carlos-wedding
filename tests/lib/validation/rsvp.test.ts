import { describe, it, expect } from 'vitest';
import { rsvpSchema } from '@/lib/validation/rsvp';

describe('rsvpSchema', () => {
  it('accepts a fully valid submission', () => {
    const result = rsvpSchema.safeParse({
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '+63 900 000 0000',
      attending: true,
      guest_count: 2,
      meal_preference: 'Vegetarian',
      message: 'Excited!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = rsvpSchema.safeParse({ email: 'juan@example.com', attending: true, guest_count: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', email: 'not-an-email', attending: true, guest_count: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects a guest_count below 1', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', email: 'juan@example.com', attending: true, guest_count: 0 });
    expect(result.success).toBe(false);
  });
});
