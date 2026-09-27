import type { EntourageMember } from '@/lib/types';
import { ENTOURAGE_CATEGORY_LABELS } from '@/lib/types';

type Member = Omit<EntourageMember, 'id'>;

export interface EntoPair {
  role: string;
  groomSide: string;
  brideSide: string;
}

export interface EntourageLayout {
  groomParents: string[];
  brideParents: string[];
  officiants: string[];
  godfathers: string[];
  godmothers: string[];
  bridesBest: string[];
  groomsBests: string[];
  pairs: EntoPair[];
  bearers: { role: string; name: string }[];
  flowerGirls: string[];
  others: { role: string; name: string }[];
}

const GENERIC_ROLE = /^(the\s+)?(groomsm[ae]n|bridesmaids?|brides\s*maids?|best\s*man|maid\s+of\s+honou?r)$/i;

/** A role label worth showing as a subtitle, or '' for a generic title. */
function subtitle(label: string | undefined): string {
  const text = (label ?? '').trim();
  return text && !GENERIC_ROLE.test(text) ? text : '';
}

/**
 * Sorts the flat member list into the blocks the Entourage section draws.
 * Ceremony sponsors are grouped by their role title into groomsman/bridesmaid
 * pairs; plain groomsmen and bridesmaids are zipped by order after them.
 */
export function layoutEntourage(members: Member[]): EntourageLayout {
  const sorted = [...members].sort((a, b) => a.sort_order - b.sort_order);
  const of = (category: Member['category']) => sorted.filter((m) => m.category === category);
  const names = (list: Member[]) => list.map((m) => m.name);

  const parents = of('parents');
  const godparents = of('godparents');

  const pairs: EntoPair[] = [];
  const byRole = new Map<string, EntoPair>();
  for (const m of of('ceremony_sponsors')) {
    const role = m.role_label.trim();
    const key = role.toLowerCase();
    let pair = byRole.get(key);
    if (!pair) {
      pair = { role, groomSide: '', brideSide: '' };
      byRole.set(key, pair);
      pairs.push(pair);
    }
    const slot = m.side === 'bride' ? 'brideSide' : 'groomSide';
    pair[slot] = pair[slot] ? `${pair[slot]}, ${m.name}` : m.name;
  }
  // Plain groomsmen and bridesmaids pair up by order. A role that is more than
  // the generic title (e.g. "To Remove the Veil") becomes the pair's subtitle.
  const groomsmen = of('groomsmen');
  const bridesmaids = of('bridesmaids');
  for (let i = 0; i < Math.max(groomsmen.length, bridesmaids.length); i++) {
    const role = [groomsmen[i]?.role_label, bridesmaids[i]?.role_label].map(subtitle).find(Boolean) ?? '';
    pairs.push({ role, groomSide: groomsmen[i]?.name ?? '', brideSide: bridesmaids[i]?.name ?? '' });
  }

  const bearers = sorted
    .filter((m) => m.category === 'ring_bearer' || m.category === 'coin_bearer' || m.category === 'bible_bearer')
    .map((m) => ({ role: m.role_label || ENTOURAGE_CATEGORY_LABELS[m.category], name: m.name }));

  return {
    groomParents: names(parents.filter((m) => m.side !== 'bride')),
    brideParents: names(parents.filter((m) => m.side === 'bride')),
    officiants: names(of('officiant')),
    godfathers: names(godparents.filter((m) => m.side !== 'bride')),
    godmothers: names(godparents.filter((m) => m.side === 'bride')),
    bridesBest: names(of('maid_of_honor')),
    groomsBests: names(of('best_man')),
    pairs,
    bearers,
    flowerGirls: names(of('flower_girls')),
    others: of('other').map((m) => ({ role: m.role_label, name: m.name })),
  };
}
