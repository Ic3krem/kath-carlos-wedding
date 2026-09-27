import { describe, it, expect } from 'vitest';
import { rsvpSchema } from '@/lib/validation/rsvp';

describe('rsvpSchema', () => {
  it('accepts a guest with companions', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', attending: true, companions: ['Ana'] });
    expect(result.success).toBe(true);
  });

  it('defaults companions to an empty list', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', attending: false });
    expect(result.success && result.data.companions).toEqual([]);
  });

  it('rejects a missing name', () => {
    expect(rsvpSchema.safeParse({ name: '   ', attending: true }).success).toBe(false);
  });

  it('rejects a non-boolean answer', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', attending: 'yes' }).success).toBe(false);
  });

  it('rejects a blank companion name', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', attending: true, companions: [' '] }).success).toBe(false);
  });
});
