import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('gallery_images').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
