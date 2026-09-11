'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/our-story', label: 'Our Story' },
  { href: '/admin/entourage', label: 'Entourage' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/rsvps', label: 'RSVPs' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-3 border-b border-black/10 p-4 sm:gap-4 sm:px-6">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm ${pathname === link.href ? 'font-semibold underline' : 'text-black/70'}`}
        >
          {link.label}
        </Link>
      ))}
      <button onClick={handleLogout} className="ml-auto text-sm text-red-600">
        Log out
      </button>
    </nav>
  );
}
