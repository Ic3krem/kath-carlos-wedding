import type { InviteAllocation } from '@/lib/types';

/** Case-, accent-, punctuation- and extra-space-insensitive form of a name. */
export function normName(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minimum typed letters (spaces ignored) before names are suggested. */
export const MIN_QUERY = 3;
const MAX_SUGGESTIONS = 6;

/**
 * Invitees whose name has a word starting with every typed word, so
 * "mar san" finds "Maria Santos". Nothing is suggested under MIN_QUERY
 * letters, which keeps the guest list from being browsed a letter at a time.
 */
export function suggestGuests(list: Pick<InviteAllocation, 'name'>[], query: string): string[] {
  const q = normName(query);
  if (q.replace(/ /g, '').length < MIN_QUERY) return [];
  const tokens = q.split(' ');
  return list
    .map((g) => g.name.trim())
    .filter((name) => {
      const words = normName(name).split(' ');
      return tokens.every((t) => words.some((w) => w.startsWith(t)));
    })
    .slice(0, MAX_SUGGESTIONS);
}

export function findGuest<T extends Pick<InviteAllocation, 'name'>>(list: T[], name: string): T | null {
  const key = normName(name);
  if (key.length < MIN_QUERY) return null;
  return list.find((g) => normName(g.name) === key) ?? null;
}

/** `max_guests` counts the invitee, so companions are the seats beyond them. */
export function companionsAllowed(guest: Pick<InviteAllocation, 'max_guests'>): number {
  return Math.max(0, (Number(guest.max_guests) || 1) - 1);
}

/** Escapes LIKE wildcards so a name is matched literally by ilike. */
export function likeLiteral(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
