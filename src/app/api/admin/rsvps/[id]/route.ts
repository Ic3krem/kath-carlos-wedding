import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/** Removes an RSVP (e.g. a test entry). The guest can then RSVP again. */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await getSupabaseServerClient().from('rsvps').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
