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
  const { error } = await supabase.from('rsvps').insert(parsed.data);
  if (error) {
    return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
