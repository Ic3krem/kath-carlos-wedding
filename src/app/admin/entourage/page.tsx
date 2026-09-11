import { getSupabaseServerClient } from '@/lib/supabase/server';
import { EntourageEditor } from '@/components/admin/EntourageEditor';
import type { EntourageMember } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminEntouragePage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('entourage_members').select('*').order('sort_order');
  return (
    <main className="flex justify-center">
      <EntourageEditor initial={(data as EntourageMember[]) ?? []} />
    </main>
  );
}
