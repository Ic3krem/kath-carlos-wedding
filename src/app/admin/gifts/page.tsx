import { CollectionEditor } from '@/components/admin/CollectionEditor';
import { SingletonForm } from '@/components/admin/SingletonForm';
import { COLLECTIONS, SINGLETONS } from '@/lib/admin/schema';
import { loadCollection, loadSingleton } from '@/lib/admin/load';
import { GIFT_INTRO_FALLBACK } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function AdminGiftsPage() {
  const [intro, options] = await Promise.all([
    loadSingleton(SINGLETONS.gift_guide.table, { intro: GIFT_INTRO_FALLBACK }),
    loadCollection(COLLECTIONS.gift_options.table),
  ]);

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-3xl flex-col gap-10 p-4 sm:p-6">
        <SingletonForm spec={SINGLETONS.gift_guide} initial={intro} />
        <hr className="border-black/10" />
        <CollectionEditor spec={COLLECTIONS.gift_options} initial={options} />
      </div>
    </main>
  );
}
