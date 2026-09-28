import type { Metadata, Viewport } from 'next';
import { getSettings } from '@/lib/content';
import { cormorant, greatVibes, lato, marckScript, montserrat } from '@/lib/fonts';
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

  return {
    title: `${coupleNames} — Wedding`,
    description: `Join ${coupleNames} as they celebrate their wedding.`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [cormorant, marckScript, greatVibes, montserrat, lato].map((f) => f.variable).join(' ');
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lxzzcx7ubyxrkqsz.public.blob.vercel-storage.com" crossOrigin="" />
        <link rel="preload" as="image" href="/florals/hydrangea1.webp" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('intro-seen'))document.documentElement.classList.add('intro-seen')}catch(e){}",
          }}
        />
      </head>
      <body className="font-serif">{children}</body>
    </html>
  );
}
