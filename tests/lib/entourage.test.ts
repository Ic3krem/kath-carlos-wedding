import { describe, it, expect } from 'vitest';
import { layoutEntourage } from '@/lib/entourage';
import { ENTOURAGE_FALLBACK } from '@/lib/content';

describe('layoutEntourage', () => {
  const e = layoutEntourage(ENTOURAGE_FALLBACK);

  it('splits parents and godparents by side', () => {
    expect(e.groomParents).toEqual(['Mr. Nestor Diaz', 'Mrs. Ma. Criste Diaz']);
    expect(e.brideParents).toEqual(['Mr. Orlando Gloria', 'Mrs. Laura Gloria']);
    expect(e.godfathers).toHaveLength(8);
    expect(e.godmothers).toHaveLength(8);
  });

  it('pairs ceremony sponsors under their role title', () => {
    expect(e.pairs[0]).toEqual({ role: 'To clothe us as One', groomSide: 'Karlo Macagba', brideSide: 'Kesia Jamel Corton' });
    expect(e.pairs).toHaveLength(5);
  });

  it('zips plain groomsmen and bridesmaids after the sponsor pairs', () => {
    const layout = layoutEntourage([
      { category: 'groomsmen', role_label: 'Groomsman', name: 'A', side: 'groom', sort_order: 0 },
      { category: 'bridesmaids', role_label: 'Bridesmaid', name: 'B', side: 'bride', sort_order: 1 },
      { category: 'groomsmen', role_label: 'Groomsman', name: 'C', side: 'groom', sort_order: 2 },
    ]);
    expect(layout.pairs).toEqual([
      { role: '', groomSide: 'A', brideSide: 'B' },
      { role: '', groomSide: 'C', brideSide: '' },
    ]);
  });

  it('keeps the bearers in order with their role', () => {
    expect(e.bearers.map((b) => b.role)).toEqual(['Ring Bearer', 'Coin Bearer', 'Bible Bearer']);
    expect(e.officiants).toEqual(['Ptr. Rodel Reyes']);
    expect(e.flowerGirls).toHaveLength(7);
  });
});
