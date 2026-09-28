import type { Rsvp } from '@/lib/types';

export type RsvpResponse = 'yes' | 'no' | 'proxy';

/** What the guest sees about a saved RSVP. */
export interface RsvpSummary {
  name: string;
  response: RsvpResponse;
  companions: string[];
  proxyName: string | null;
  total: number;
}

export function summarize(row: Pick<Rsvp, 'name' | 'attending' | 'guest_count' | 'guest_names'> & { proxy_name?: string | null }): RsvpSummary {
  const proxyName = row.proxy_name?.trim() || null;
  return {
    name: row.name,
    response: proxyName ? 'proxy' : row.attending ? 'yes' : 'no',
    companions: row.guest_names
      ? row.guest_names
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    proxyName,
    total: row.attending ? row.guest_count : 0,
  };
}
