import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';

export const dynamic = 'force-dynamic';

export default async function AdminTimelinePage() {
  const items = await loadCollection(COLLECTIONS.timeline_items.table);
  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-8 p-4 sm:p-6">
        <CollectionEditor spec={COLLECTIONS.timeline_items} initial={items} />
      </div>
    </main>
  );
}
