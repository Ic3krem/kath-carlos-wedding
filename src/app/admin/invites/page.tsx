import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { BulkGuestImport } from '@/components/admin/BulkGuestImport';
import { COLLECTIONS } from '@/lib/admin/schema';
import { loadCollection } from '@/lib/admin/load';

export const dynamic = 'force-dynamic';

export default async function AdminInvitesPage() {
  const guests = await loadCollection(COLLECTIONS.invite_allocations.table);
  // Before migration 010 the column is missing; show the old seat count as companions.
  const rows = guests.map((g) =>
    g.companions_allowed == null ? { ...g, companions_allowed: Math.max(0, Number(g.max_guests ?? 1) - 1) } : g,
  );
  const totalSeats = rows.reduce((sum, g) => sum + 1 + Number(g.companions_allowed ?? 0), 0);

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-10 p-4 sm:p-6">
        <p className="rounded-md bg-black/5 px-4 py-3 text-sm">
          <strong>{rows.length}</strong> invitees · up to <strong>{totalSeats}</strong> seats if everyone brings their full allowance.
        </p>
        <CollectionEditor spec={COLLECTIONS.invite_allocations} initial={rows} />
        <BulkGuestImport existing={rows.map((g) => String(g.name ?? ''))} />
      </div>
    </main>
  );
}
