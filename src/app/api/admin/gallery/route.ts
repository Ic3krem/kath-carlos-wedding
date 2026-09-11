import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('gallery_images').select('*').order('sort_order');
  if (error) {
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.image_url) {
    return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({ image_url: body.image_url, caption: body.caption ?? null, sort_order: body.sort_order ?? 0 })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
