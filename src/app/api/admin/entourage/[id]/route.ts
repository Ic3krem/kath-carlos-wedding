import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('entourage_members')
    .update({
      category: body.category,
      role_label: body.role_label,
      name: body.name,
      side: body.side ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .eq('id', params.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('entourage_members').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
