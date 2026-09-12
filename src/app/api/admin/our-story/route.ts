import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('our_story').select('*').eq('id', 1).single();
  if (error) {
    return NextResponse.json({ error: 'Failed to load story' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('our_story')
    .update({
      image_url: body.image_url,
      image_url_2: body.image_url_2 ?? null,
      title: body.title,
      excerpt: body.excerpt,
      excerpt_2: body.excerpt_2 ?? '',
      full_story: body.full_story,
      button_label: body.button_label,
    })
    .eq('id', 1)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
  }
  return NextResponse.json(data);
}
