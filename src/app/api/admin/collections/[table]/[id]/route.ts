import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCollectionSpec, pickFields } from '@/lib/admin/schema';

interface RouteParams {
  params: { table: string; id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const spec = getCollectionSpec(params.table);
  if (!spec) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(spec.table)
    .update(pickFields(spec.fields, body))
    .eq('id', params.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to update row' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const spec = getCollectionSpec(params.table);
  if (!spec) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from(spec.table).delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete row' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
