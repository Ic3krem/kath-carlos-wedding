import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Rsvp } from '@/lib/types';

const HEADERS: (keyof Rsvp)[] = ['name', 'email', 'phone', 'attending', 'guest_count', 'meal_preference', 'message', 'created_at'];

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load RSVPs' }, { status: 500 });
  }

  const rows = (data as Rsvp[]).map((rsvp) => HEADERS.map((key) => csvEscape(rsvp[key])).join(','));
  const csv = [HEADERS.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="rsvps.csv"',
    },
  });
}
