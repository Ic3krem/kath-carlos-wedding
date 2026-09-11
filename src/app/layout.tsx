import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kath & Carlos',
  description: 'Kath & Carlos wedding website',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
