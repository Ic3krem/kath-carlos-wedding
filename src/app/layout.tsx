import type { Metadata } from 'next';
import { Marck_Script } from 'next/font/google';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings } from '@/lib/types';
import './globals.css';

const marckScript = Marck_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
});

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
    <html lang="en" className={marckScript.variable}>
      <body>{children}</body>
    </html>
  );
}
