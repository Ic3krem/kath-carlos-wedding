import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCollectionSpec, pickFields } from '@/lib/admin/schema';

interface RouteParams {
  params: { table: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const spec = getCollectionSpec(params.table);
  if (!spec) {
    return NextResponse.json({ error: 'Unknown collection' }, { status: 404 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(spec.table).select('*').order('sort_order');
  if (error) {
    return NextResponse.json({ error: `Failed to load ${spec.title}` }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    .insert(pickFields(spec.fields, body))
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create row' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
