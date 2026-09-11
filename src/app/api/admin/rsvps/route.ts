import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load RSVPs' }, { status: 500 });
  }
  return NextResponse.json(data);
}
