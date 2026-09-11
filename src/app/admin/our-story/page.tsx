import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OurStoryForm } from '@/components/admin/OurStoryForm';
import type { OurStory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminOurStoryPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('our_story').select('*').eq('id', 1).single<OurStory>();

  if (!data) {
    return (
      <main className="flex justify-center p-8 text-center">
        <p className="text-black/60">Our story row not found — check your database setup.</p>
      </main>
    );
  }

  return (
    <main className="flex justify-center">
      <OurStoryForm initial={data} />
    </main>
  );
}
