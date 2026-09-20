import Link from 'next/link';

const SECTIONS = [
  { href: '/admin/settings', label: 'Site Settings', description: 'Couple names, wedding date, hero image, theme, maps.' },
  { href: '/admin/our-story', label: 'Our Story', description: 'Story blocks, full story, and the dated milestones.' },
  { href: '/admin/entourage', label: 'Entourage', description: 'Parents, godparents, and other roles.' },
  { href: '/admin/gallery', label: 'Gallery', description: 'Photo gallery images.' },
  { href: '/admin/schedule', label: 'Schedule', description: 'The weekend itinerary cards.' },
  { href: '/admin/logistics', label: 'Guest Notes', description: 'Dress code, palette, where to stay, getting there.' },
  { href: '/admin/gifts', label: 'Gifts', description: 'Gift guide intro and the gift options.' },
  { href: '/admin/contacts', label: 'Contacts', description: 'Who guests can reach, shown in the footer.' },
  {
    href: '/admin/invites',
    label: 'Invite allocations',
    description: 'The max party size allowed for each invitee, matched by name on the RSVP form.',
  },
  { href: '/admin/rsvps', label: 'RSVPs', description: 'View and export guest responses.' },
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
