import type { Metadata } from 'next';
import { Marck_Script, Poppins } from 'next/font/google';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings } from '@/lib/types';
import './globals.css';

const marckScript = Marck_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
});

// Metropolis (the reference design's UI typeface) isn't on Google Fonts;
// Poppins is the closest freely-licensed geometric-sans match.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-metropolis',
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
    <html lang="en" className={`${marckScript.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
