import type { Settings } from '@/lib/types';
import { buildVenues } from './VenueSchedule';
import { Reveal } from './Reveal';

interface FooterProps {
  settings: Settings;
}

export function Footer({ settings }: FooterProps) {
  const year = new Date(settings.wedding_date).getUTCFullYear();

  return (
    <footer className="w-full bg-black px-4 py-12 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1550px] flex-col gap-10">
        <Reveal className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-script text-4xl sm:text-5xl">{settings.couple_names}</h2>
          {buildVenues(settings).map((venue) => (
            <p key={venue.label} className="max-w-xl text-sm text-white/60">
              {[venue.label, venue.name, venue.address].filter(Boolean).join(' · ')}
            </p>
          ))}
        </Reveal>

        <p className="border-t border-white/10 pt-6 text-center text-xs text-white/55">
          {settings.couple_names} — {year}
        </p>
      </div>
    </footer>
  );
}
