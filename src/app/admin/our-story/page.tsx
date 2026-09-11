import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OurStoryForm } from '@/components/admin/OurStoryForm';
import type { OurStory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminOurStoryPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('our_story').select('*').eq('id', 1).single<OurStory>();
  return (
    <main className="flex justify-center">
      <OurStoryForm initial={data as OurStory} />
    </main>
  );
}
