import { getSupabaseServerClient } from '@/lib/supabase/server';
import { GalleryManager } from '@/components/admin/GalleryManager';
import type { GalleryImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
  return (
    <main className="flex justify-center">
      <GalleryManager initial={(data as GalleryImage[]) ?? []} />
    </main>
  );
}
