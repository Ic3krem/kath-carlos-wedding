import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';

export const dynamic = 'force-dynamic';

export default async function AdminOurStoryPage() {
  const milestones = await loadCollection(COLLECTIONS.story_milestones.table);
  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-8 p-4 sm:p-6">
        <CollectionEditor spec={COLLECTIONS.story_milestones} initial={milestones} />
      </div>
    </main>
  );
}
