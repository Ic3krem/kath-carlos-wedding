import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { SingletonForm } from '@/components/admin/SingletonForm';
import { COLLECTIONS, SINGLETONS } from '@/lib/admin/schema';
import { loadCollection, loadSingleton } from '@/lib/admin/load';
import { LOGISTICS_FALLBACK, THEME_FALLBACK } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function AdminLogisticsPage() {
  const [logistics, themeDetails, colors] = await Promise.all([
    loadSingleton(SINGLETONS.logistics.table, LOGISTICS_FALLBACK),
    loadSingleton(SINGLETONS.theme_details.table, THEME_FALLBACK),
    loadCollection(COLLECTIONS.theme_colors.table),
  ]);

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-10 p-4 sm:p-6">
        <SingletonForm spec={SINGLETONS.logistics} initial={logistics} />
        <hr className="border-black/10" />
        <SingletonForm spec={SINGLETONS.theme_details} initial={themeDetails} />
        <hr className="border-black/10" />
        <CollectionEditor spec={COLLECTIONS.theme_colors} initial={colors} />
      </div>
    </main>
  );
}
