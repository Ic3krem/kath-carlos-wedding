import type { Contact, Settings } from '@/lib/types';

interface FooterProps {
  settings: Settings;
  contacts: Pick<Contact, 'role' | 'name' | 'phone' | 'email'>[];
}

export function Footer({ settings, contacts }: FooterProps) {
  const year = new Date(settings.wedding_date).getUTCFullYear();

  return (
    <footer className="w-full bg-black px-1.5 py-12 text-white sm:px-3 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1550px] flex-col gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-script text-4xl sm:text-5xl">{settings.couple_names}</h2>
          {settings.maps_address && <p className="max-w-xl text-sm text-white/60">{settings.maps_address}</p>}
        </div>

        {contacts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {contacts.map((contact) => (
              <div
                key={`${contact.role}-${contact.name}`}
                className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left"
              >
                <span className="text-xs uppercase tracking-wide text-white/60">{contact.role}</span>
                <span className="font-semibold">{contact.name}</span>
                {contact.phone && (
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-sm text-white/70 hover:text-white">
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="text-sm text-white/70 hover:text-white">
                    {contact.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="border-t border-white/10 pt-6 text-center text-xs text-white/55">
          {settings.couple_names} — {year}
        </p>
      </div>
    </footer>
  );
}
