import { NextRequest, NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validation/rsvp';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Per-invitee seat cap: the guest types their full name (no dropdown), and
  // it is matched here against the list the couple set up in /admin/invites.
  // A name with no matching row has no cap, so the form still works before
  // that list is filled in.
  const { data: allocation } = await supabase
    .from('invite_allocations')
    .select('max_guests')
    .ilike('name', parsed.data.name.trim())
    .maybeSingle();

  if (allocation && parsed.data.guest_count > allocation.max_guests) {
    return NextResponse.json(
      {
        error: {
          formErrors: [
            `Your invite allows up to ${allocation.max_guests} guest${allocation.max_guests === 1 ? '' : 's'}. Please adjust your party size.`,
          ],
        },
      },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('rsvps').insert(parsed.data);
  if (error) {
    return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
