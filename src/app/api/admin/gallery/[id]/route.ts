import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isBlobUrl } from '@/lib/image/blob-url';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  if ('caption' in body) patch.caption = typeof body.caption === 'string' && body.caption.trim() ? body.caption.trim() : null;
  if ('sort_order' in body && Number.isFinite(Number(body.sort_order))) patch.sort_order = Number(body.sort_order);

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('gallery_images').update(patch).eq('id', params.id).select().single();
  if (error) {
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const supabase = getSupabaseServerClient();
  const { data: row } = await supabase.from('gallery_images').select('image_url').eq('id', params.id).maybeSingle();

  const { error } = await supabase.from('gallery_images').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }

  // Free the storage too. The row is already gone, so a Blob hiccup here only
  // leaves an orphaned file rather than a broken gallery.
  if (row?.image_url && isBlobUrl(row.image_url)) {
    await del(row.image_url).catch(() => undefined);
  }
  return NextResponse.json({ success: true });
}
