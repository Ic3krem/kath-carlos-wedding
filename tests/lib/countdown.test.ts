import { describe, it, expect } from 'vitest';
import { getCountdownParts } from '@/lib/countdown';

describe('getCountdownParts', () => {
  it('marks a past target as isPast with zeroed parts', () => {
    const now = new Date('2026-06-01T00:00:00Z');
    const target = new Date('2026-01-01T00:00:00Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
  });

  it('breaks down a whole-month gap with no remainder', () => {
    const now = new Date('2026-01-15T00:00:00Z');
    const target = new Date('2026-04-15T00:00:00Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 3, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  });

  it('breaks down hours/minutes/seconds within a day', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const target = new Date('2026-01-01T01:30:45Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 0, weeks: 0, days: 0, hours: 1, minutes: 30, seconds: 45, isPast: false });
  });

  it('breaks down weeks and days after removing whole months', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const target = new Date('2026-02-16T00:00:00Z'); // 1 month + 15 days = 2 weeks + 1 day
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 1, weeks: 2, days: 1, hours: 0, minutes: 0, seconds: 0, isPast: false });
  });
});
