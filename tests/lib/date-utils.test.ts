import { describe, it, expect } from 'vitest';
import { toLocalDatetimeInputValue } from '@/lib/date-utils';

describe('toLocalDatetimeInputValue', () => {
  it('converts a UTC ISO string to local datetime-local components', () => {
    const iso = '2026-06-15T10:30:00.000Z';
    const date = new Date(iso);
    const offsetMinutes = date.getTimezoneOffset();
    const expectedLocal = new Date(date.getTime() - offsetMinutes * 60000).toISOString().slice(0, 16);

    expect(toLocalDatetimeInputValue(iso)).toBe(expectedLocal);
  });

  it('round-trips back to the same instant when parsed as local time', () => {
    const iso = '2026-12-25T00:00:00.000Z';
    const localValue = toLocalDatetimeInputValue(iso);
    const roundTripped = new Date(localValue).toISOString();

    expect(roundTripped).toBe(iso);
  });
});
