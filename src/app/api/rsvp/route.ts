import { NextRequest, NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validation/rsvp';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInviteAllocations } from '@/lib/content';
import { companionsAllowed, findGuest, likeLiteral } from '@/lib/rsvp/guests';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 });
  }

  // Only names on the invite list can RSVP, and never with more companions
  // than the seats reserved for them.
  const guest = findGuest(await getInviteAllocations(), parsed.data.name);
  if (!guest) {
    return NextResponse.json(
      { error: "We couldn't find that name. Please type your name as it appears on your invitation." },
      { status: 404 },
    );
  }

  const attending = parsed.data.attending;
  const companions = attending ? parsed.data.companions : [];
  const allowed = companionsAllowed(guest);
  if (companions.length > allowed) {
    return NextResponse.json(
      { error: `Your invitation allows ${allowed} companion${allowed === 1 ? '' : 's'}.` },
      { status: 400 },
    );
  }

  const row = {
    name: guest.name,
    attending,
    guest_count: attending ? 1 + companions.length : 0,
    guest_names: companions.length ? companions.join(', ') : null,
  };

  // One RSVP per invitee: a resubmission replaces the earlier answer.
  const supabase = getSupabaseServerClient();
  const { data: existing } = await supabase
    .from('rsvps')
    .select('id')
    .ilike('name', likeLiteral(guest.name))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from('rsvps')
        .update(row)
        .eq('id', existing.id)
    : await supabase.from('rsvps').insert(row);

  if (error) {
    return NextResponse.json({ error: 'We could not save your RSVP. Please try again.' }, { status: 500 });
  }

  return NextResponse.json(
    { name: guest.name, attending, companions, total: row.guest_count, updated: Boolean(existing) },
    { status: existing ? 200 : 201 },
  );
}
