import Link from 'next/link';

const SECTIONS = [
  { href: '/admin/gallery', label: 'Gallery', description: 'Upload photos (compressed automatically), caption and reorder them.' },
  { href: '/admin/invites', label: 'Guest list', description: 'Who can RSVP, and how many seats each invitee has.' },
  { href: '/admin/rsvps', label: 'RSVPs', description: 'View and export guest responses.' },
  { href: '/admin/settings', label: 'Site Settings', description: 'Names, date, hero photo, venues and directions.' },
  { href: '/admin/our-story', label: 'Our Story', description: 'The photo-and-text story blocks.' },
  { href: '/admin/entourage', label: 'Entourage', description: 'Parents, officiant, godparents, pairs, bearers, flower girls.' },
  { href: '/admin/schedule', label: 'Timeline', description: 'The wedding-day timeline cards.' },
  { href: '/admin/logistics', label: 'Attire Guide', description: 'Attire text and the colour palette.' },
  { href: '/admin/gifts', label: 'Gift Guide', description: 'The gift guide text.' },
];

export default function AdminDashboardPage() {
  return (
    <main className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      {SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} className="rounded-lg border border-black/10 p-4 hover:border-black/30">
          <h2 className="text-lg font-semibold">{section.label}</h2>
          <p className="text-sm text-black/60">{section.description}</p>
        </Link>
      ))}
    </main>
  );
}
