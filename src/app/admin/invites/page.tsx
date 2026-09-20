import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';

export const dynamic = 'force-dynamic';

export default async function AdminInvitesPage() {
  const allocations = await loadCollection(COLLECTIONS.invite_allocations.table);

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-10 p-4 sm:p-6">
        <CollectionEditor spec={COLLECTIONS.invite_allocations} initial={allocations} />
      </div>
    </main>
  );
}
