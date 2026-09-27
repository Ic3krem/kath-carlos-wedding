import { describe, it, expect } from 'vitest';
import { companionsAllowed, findGuest, likeLiteral, normName, suggestGuests } from '@/lib/rsvp/guests';

const LIST = [{ name: 'Maria Santos' }, { name: 'Mario Dela Cruz' }, { name: 'Ana Cruz' }];

describe('rsvp guest matching', () => {
  it('normalises case, accents, punctuation and spacing', () => {
    expect(normName('  MaríA   Sántos-Cruz ')).toBe('maria santos cruz');
  });

  it('suggests nothing until three letters are typed', () => {
    expect(suggestGuests(LIST, 'ma')).toEqual([]);
    expect(suggestGuests(LIST, 'mar')).toEqual(['Maria Santos', 'Mario Dela Cruz']);
  });

  it('requires every typed word to start a word in the name', () => {
    expect(suggestGuests(LIST, 'mar san')).toEqual(['Maria Santos']);
    expect(suggestGuests(LIST, 'cru')).toEqual(['Mario Dela Cruz', 'Ana Cruz']);
    expect(suggestGuests(LIST, 'antos')).toEqual([]);
  });

  it('finds an exact (normalised) name only', () => {
    expect(findGuest(LIST, 'ana  CRUZ')).toEqual({ name: 'Ana Cruz' });
    expect(findGuest(LIST, 'Ana')).toBeNull();
  });

  it('counts companions as seats beyond the invitee', () => {
    expect(companionsAllowed({ max_guests: 3 })).toBe(2);
    expect(companionsAllowed({ max_guests: 1 })).toBe(0);
    expect(companionsAllowed({ max_guests: 0 })).toBe(0);
  });

  it('escapes LIKE wildcards', () => {
    expect(likeLiteral('100%_ok')).toBe('100\\%\\_ok');
  });
});
