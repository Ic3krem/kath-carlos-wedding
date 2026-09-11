import type { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings } from '@/lib/types';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  let coupleNames = 'Our Wedding';

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.from('settings').select('couple_names').eq('id', 1).single<Pick<Settings, 'couple_names'>>();
    if (data?.couple_names) {
      coupleNames = data.couple_names;
    }
  } catch {
    // Supabase not configured yet or request failed — fall back to a generic title.
  }

  return {
    title: coupleNames,
    description: `${coupleNames} wedding website`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
