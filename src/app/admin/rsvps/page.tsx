import { getSupabaseServerClient } from '@/lib/supabase/server';
import { RsvpTable } from '@/components/admin/RsvpTable';
import type { Rsvp } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminRsvpsPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  return <RsvpTable rsvps={(data as Rsvp[]) ?? []} />;
}
