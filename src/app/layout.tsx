import type { Metadata } from 'next';
import { getSettings } from '@/lib/content';
import { marckScript, poppins } from '@/lib/fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  // Shared with the page body via React.cache(), so this costs no extra query.
  const settings = await getSettings();
  const coupleNames = settings?.couple_names || 'Our Wedding';

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
