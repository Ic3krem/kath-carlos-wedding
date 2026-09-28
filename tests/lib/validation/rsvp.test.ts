import { describe, it, expect } from 'vitest';
import { rsvpSchema } from '@/lib/validation/rsvp';

describe('rsvpSchema', () => {
  it('accepts a guest with companions', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', response: 'yes', companions: ['Ana'] }).success).toBe(true);
  });

  it('defaults companions to an empty list', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', response: 'no' });
    expect(result.success && result.data.companions).toEqual([]);
  });

  it('rejects a missing name', () => {
    expect(rsvpSchema.safeParse({ name: '   ', response: 'yes' }).success).toBe(false);
  });

  it('rejects an unknown response', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', response: 'maybe' }).success).toBe(false);
  });

  it('requires a proxy name for a proxy response', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', response: 'proxy' }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: 'Juan', response: 'proxy', proxyName: 'Pedro' }).success).toBe(true);
  });

  it('rejects a blank companion name', () => {
    expect(rsvpSchema.safeParse({ name: 'Juan', response: 'yes', companions: [' '] }).success).toBe(false);
  });
});
