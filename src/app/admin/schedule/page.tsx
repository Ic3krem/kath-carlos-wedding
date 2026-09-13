import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';

export const dynamic = 'force-dynamic';

export default async function AdminSchedulePage() {
  const events = await loadCollection(COLLECTIONS.schedule_events.table);
  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-8 p-4 sm:p-6">
        <CollectionEditor spec={COLLECTIONS.schedule_events} initial={events} />
      </div>
    </main>
  );
}
