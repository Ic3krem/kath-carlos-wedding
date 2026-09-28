import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInviteAllocations } from '@/lib/content';
import { companionsAllowed, findGuest, likeLiteral, suggestGuests } from '@/lib/rsvp/guests';
import { summarize } from '@/lib/rsvp/summary';

export const dynamic = 'force-dynamic';

/**
 * Guest-list lookups for the RSVP form.
 *   ?q=<partial name>  -> { names: string[] }   suggestions while typing
 *   ?name=<full name>  -> { found, name, companions, alreadyResponded }
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const list = await getInviteAllocations();

  const q = params.get('q');
  if (q !== null) {
    return NextResponse.json({ names: suggestGuests(list, q) });
  }

  const name = params.get('name');
  if (name !== null) {
    const guest = findGuest(list, name);
    if (!guest) return NextResponse.json({ found: false });

    // A saved RSVP is shown instead of the form (one RSVP per invitee).
    let rsvp = null;
    try {
      const { data } = await getSupabaseServerClient()
        .from('rsvps')
        .select('*')
        .ilike('name', likeLiteral(guest.name))
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) rsvp = summarize(data[0]);
    } catch {
      // Not knowing only means the form shows; the POST still refuses a repeat.
    }

    return NextResponse.json({
      found: true,
      name: guest.name,
      companions: companionsAllowed(guest),
      alreadyResponded: Boolean(rsvp),
      rsvp,
    });
  }

  return NextResponse.json({ error: 'Pass ?q= or ?name=' }, { status: 400 });
}
