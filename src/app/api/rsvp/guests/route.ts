import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInviteAllocations } from '@/lib/content';
import { companionsAllowed, findGuest, likeLiteral, suggestGuests } from '@/lib/rsvp/guests';

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

    let alreadyResponded = false;
    try {
      const { data } = await getSupabaseServerClient()
        .from('rsvps')
        .select('id')
        .ilike('name', likeLiteral(guest.name))
        .limit(1);
      alreadyResponded = Boolean(data && data.length > 0);
    } catch {
      // Not knowing only hides the "we already have your RSVP" note.
    }

    return NextResponse.json({
      found: true,
      name: guest.name,
      companions: companionsAllowed(guest),
      alreadyResponded,
    });
  }

  return NextResponse.json({ error: 'Pass ?q= or ?name=' }, { status: 400 });
}
