import { getSupabaseServerClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import type { Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single<Settings>();
  return (
    <main className="flex justify-center">
      <SettingsForm initial={data as Settings} />
    </main>
  );
}
