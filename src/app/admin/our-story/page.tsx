import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OurStoryForm } from '@/components/admin/OurStoryForm';
import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';
import type { OurStory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminOurStoryPage() {
  const supabase = getSupabaseServerClient();
  const [{ data }, milestones] = await Promise.all([
    supabase.from('our_story').select('*').eq('id', 1).single<OurStory>(),
    loadCollection(COLLECTIONS.story_milestones.table),
  ]);

  if (!data) {
    return (
      <main className="flex justify-center p-8 text-center">
        <p className="text-black/60">Our story row not found — check your database setup.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center">
      <OurStoryForm initial={data} />
      <div className="w-full max-w-2xl px-4 pb-10 sm:px-6">
        <hr className="mb-8 border-black/10" />
        <CollectionEditor spec={COLLECTIONS.story_milestones} initial={milestones} />
      </div>
    </main>
  );
}
