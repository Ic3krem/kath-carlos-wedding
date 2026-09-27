import { describe, it, expect } from 'vitest';
import { parseGuestLines } from '@/components/admin/BulkGuestImport';

describe('parseGuestLines', () => {
  it('reads name and companions from each line', () => {
    expect(parseGuestLines('Maria Santos, 2\nJohn Reyes\n\n  Ana Cruz\t1  \nMr. & Mrs. Lim; 3')).toEqual([
      { name: 'Maria Santos', companions_allowed: 2 },
      { name: 'John Reyes', companions_allowed: 0 },
      { name: 'Ana Cruz', companions_allowed: 1 },
      { name: 'Mr. & Mrs. Lim', companions_allowed: 3 },
    ]);
  });
});
