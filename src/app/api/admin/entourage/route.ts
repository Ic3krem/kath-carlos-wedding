import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('entourage_members').select('*').order('sort_order');
  if (error) {
    return NextResponse.json({ error: 'Failed to load entourage' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('entourage_members')
    .insert({
      category: body.category,
      role_label: body.role_label,
      name: body.name,
      side: body.side ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
