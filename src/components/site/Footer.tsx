import type { Settings } from '@/lib/types';

// Placeholder contact details — replace with the couple's real details.
const CONTACTS = [
  { role: 'Bride', name: 'Kath Santos', phone: '+63 917 000 0001', email: 'kath@example.com' },
  { role: 'Groom', name: 'Carlos Reyes', phone: '+63 917 000 0002', email: 'carlos@example.com' },
  { role: 'Wedding Coordinator', name: 'Andrea Lim', phone: '+63 917 000 0003', email: 'coordinator@example.com' },
];

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date(settings.wedding_date).getUTCFullYear();

  return (
    <footer className="w-full bg-black px-4 py-12 text-white sm:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-script text-4xl sm:text-5xl">{settings.couple_names}</h2>
          {settings.maps_address && <p className="max-w-xl text-sm text-white/60">{settings.maps_address}</p>}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {CONTACTS.map((contact) => (
            <div key={contact.role} className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
              <span className="text-xs uppercase tracking-wide text-white/50">{contact.role}</span>
              <span className="font-semibold">{contact.name}</span>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-sm text-white/70 hover:text-white">
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="text-sm text-white/70 hover:text-white">
                {contact.email}
              </a>
            </div>
          ))}
        </div>

        <p className="border-t border-white/10 pt-6 text-center text-xs text-white/40">
          {settings.couple_names} — {year}
        </p>
      </div>
    </footer>
  );
}
