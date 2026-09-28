import type { Metadata, Viewport } from 'next';
import { getSettings } from '@/lib/content';
import { formatLongDate } from '@/lib/date-utils';
import { cormorant, greatVibes, lato, marckScript, montserrat } from '@/lib/fonts';
import { PERF_BOOT_SCRIPT } from '@/lib/perf-boot';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4f6f8f',
};

export async function generateMetadata(): Promise<Metadata> {
  // Shared with the page body via React.cache(), so this costs no extra query.
  const settings = await getSettings();
  const coupleNames = settings?.couple_names || 'Carlos & Kath';

  const siteUrl = process.env.SITE_URL || 'https://wedding.jcd.quest';
  const when = settings?.wedding_date ? formatLongDate(settings.wedding_date) : 'November 28, 2026';
  const where = settings?.ceremony_address || 'Alasasin, Mariveles, Bataan';
  const title = `${coupleNames} — Wedding`;
  const description = `You're invited! Celebrate with ${coupleNames} on ${when} · ${where}. Kindly RSVP online.`;
  // The link preview shown when the site is shared (Facebook, Messenger,
  // Viber, WhatsApp, X, iMessage…): the opening bouquet from the intro.
  const image = {
    url: '/og.jpg',
    secureUrl: `${siteUrl}/og.jpg`,
    type: 'image/jpeg',
    width: 1200,
    height: 630,
    alt: `The wedding of ${coupleNames}`,
  };

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: '/',
      siteName: title,
      title,
      description,
      locale: 'en_PH',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [cormorant, marckScript, greatVibes, montserrat, lato].map((f) => f.variable).join(' ');
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lxzzcx7ubyxrkqsz.public.blob.vercel-storage.com" crossOrigin="" />
        {/* Facebook's debugger asks for an app id; set FB_APP_ID in Vercel to add it. */}
        {process.env.FB_APP_ID && <meta property="fb:app_id" content={process.env.FB_APP_ID} />}
        <script dangerouslySetInnerHTML={{ __html: PERF_BOOT_SCRIPT }} />
      </head>
      <body className="font-serif">{children}</body>
    </html>
  );
}
