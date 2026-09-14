import type { Metadata, Viewport } from 'next';
import { getSettings } from '@/lib/content';
import { marckScript, poppins } from '@/lib/fonts';
import './globals.css';

/**
 * The layout is built against the device's own width, so pinch-zooming out
 * only breaks the framing the design depends on. Note that iOS Safari has
 * ignored user-scalable since iOS 10 and will still allow a pinch — nothing
 * here can prevent that, by design on Apple's part.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

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
