import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSingletonSpec, pickFields } from '@/lib/admin/schema';

interface RouteParams {
  params: { table: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const spec = getSingletonSpec(params.table);
  if (!spec) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(spec.table).select('*').eq('id', 1).single();
  if (error) {
    return NextResponse.json({ error: `Failed to load ${spec.title}` }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const spec = getSingletonSpec(params.table);
  if (!spec) {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  // Upsert rather than update: these rows are seeded by migration, but a table
  // created without its seed row would otherwise be uneditable.
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(spec.table)
    .upsert({ id: 1, ...pickFields(spec.fields, body) })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
  return NextResponse.json(data);
}
