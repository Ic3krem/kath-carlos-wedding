import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Row } from '@/lib/admin/schema';

/**
 * Admin reads tolerate a missing table the same way the public reads do: a
 * section whose migration has not been applied yet shows its fallback copy
 * instead of crashing the page.
 */
export async function loadCollection(table: string): Promise<Row[]> {
  try {
    const { data, error } = await getSupabaseServerClient().from(table).select('*').order('sort_order');
    return error ? [] : ((data as Row[]) ?? []);
  } catch {
    return [];
  }
}

/** The stored row, or the public fallback so the form opens on real copy. */
export async function loadSingleton(table: string, fallback: Row): Promise<Row> {
  try {
    const { data, error } = await getSupabaseServerClient().from(table).select('*').eq('id', 1).single<Row>();
    return error || !data ? { id: 1, ...fallback } : data;
  } catch {
    return { id: 1, ...fallback };
  }
}
