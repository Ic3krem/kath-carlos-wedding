import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
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
    .from('settings')
    .update({
      couple_names: body.couple_names,
      wedding_date: body.wedding_date,
      hero_image_url: body.hero_image_url,
      theme: body.theme,
      maps_address: body.maps_address,
      maps_embed_url: body.maps_embed_url,
    })
    .eq('id', 1)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
  return NextResponse.json(data);
}
