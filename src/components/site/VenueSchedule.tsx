import type { ScheduleEvent, Settings } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionIntro } from './SectionIntro';

interface Venue {
  label: string;
  name: string | null;
  address: string | null;
  embedUrl: string | null;
}

type Event = Omit<ScheduleEvent, 'id'>;

/**
 * Ceremony and reception are separate places. Sites set up before the venue
 * columns existed only have the legacy maps_* pair, which stands in for the
 * ceremony so nothing disappears.
 */
export function buildVenues(settings: Settings): Venue[] {
  const venues: Venue[] = [
    {
      label: 'Ceremony',
      name: settings.ceremony_name,
      address: settings.ceremony_address ?? settings.maps_address,
      embedUrl: settings.ceremony_embed_url ?? settings.maps_embed_url,
    },
    {
      label: 'Reception',
      name: settings.reception_name,
      address: settings.reception_address,
      embedUrl: settings.reception_embed_url,
    },
  ];
  return venues.filter((venue) => venue.embedUrl || venue.name || venue.address);
}

function mapsLink(venue: Venue) {
  const query = [venue.name, venue.address].filter(Boolean).join(', ');
  return query ? `https://maps.google.com/?q=${encodeURIComponent(query)}` : null;
}

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const link = mapsLink(venue);

  return (
    <Reveal
      from={index === 0 ? 'left' : 'right'}
      delay={index * 140}
      className="h-full overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
    >
      {/* The two venues sit side by side, so each card stacks its map over its
          details rather than splitting them left and right. */}
      <div className="flex h-full flex-col">
        {venue.embedUrl && (
          <div className="aspect-[16/10]">
            <iframe
              src={venue.embedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${venue.label} map${venue.name ? ` — ${venue.name}` : ''}`}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between gap-6 p-8 lg:p-10">
          <div className="space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              {venue.label}
            </span>
            {venue.name && <h3 className="font-script text-3xl text-black sm:text-4xl">{venue.name}</h3>}
            {venue.address && <p className="text-sm leading-relaxed text-black/55">{venue.address}</p>}
          </div>

          {link && (
            <div className="border-t border-black/10 pt-5">
              <a
                href={link}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-300 hover:bg-accent"
              >
                Open in Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const agenda = event.agenda
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [time, ...rest] = row.split('|');
      return { time: time.trim(), what: rest.join('|').trim() };
    });

  return (
    <Reveal
      delay={index * 120}
      className={`relative space-y-4 rounded-2xl p-8 shadow-sm transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0 ${
        event.is_highlight
          ? 'border-2 border-accent/40 bg-black/[0.03] shadow-md'
          : 'border border-black/10 bg-white hover:border-accent/40'
      }`}
    >
      {event.day_label && (
        <span
          className={`absolute right-6 top-6 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
            event.is_highlight ? 'bg-black text-white' : 'bg-accent/15 text-accent'
          }`}
        >
          {event.day_label}
        </span>
      )}

      {event.date_label && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
          {event.date_label}
        </p>
      )}
      <h4 className="text-xl text-black">{event.title}</h4>

      {event.time_label && <p className="text-xs text-black/45">{event.time_label}</p>}

      {agenda.length > 0 ? (
        <ul className="space-y-3 pt-1">
          {agenda.map((row) => (
            <li key={`${row.time}-${row.what}`} className="flex gap-3">
              <span className="w-16 shrink-0 text-[10px] font-semibold uppercase text-accent">
                {row.time}
              </span>
              <span className="text-xs text-black/70">{row.what}</span>
            </li>
          ))}
        </ul>
      ) : (
        event.body && <p className="text-xs leading-relaxed text-black/60">{event.body}</p>
      )}

      {event.attire && (
        <p className="border-t border-black/10 pt-3 text-xs text-black/45">
          <strong className="font-medium text-black">Attire:</strong> {event.attire}
        </p>
      )}
    </Reveal>
  );
}

export function VenueSchedule({ settings, events }: { settings: Settings; events: Event[] }) {
  const venues = buildVenues(settings);
  if (venues.length === 0 && events.length === 0) return null;

  return (
    <section
      id="venue"
      className="flex w-full flex-col items-center gap-12 px-1.5 py-12 sm:px-3 sm:py-16 lg:px-6 lg:py-20"
    >
      <SectionIntro
        eyebrow="Chapter III • The places"
        title="Venue & Schedule"
        blurb="Where to be, and when to be there."
      />

      {/* Ceremony left, reception right — buildVenues keeps that order. */}
      <div className="grid w-full max-w-[1200px] grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        {venues.map((venue, index) => (
          <VenueCard key={venue.label} venue={venue} index={index} />
        ))}
      </div>

      {events.length > 0 && (
        <div className="w-full max-w-[1200px] space-y-10" id="itinerary">
          <Reveal className="mx-auto max-w-xl text-center">
            <h3 className="font-script text-3xl text-black sm:text-4xl">The Weekend</h3>
            <p className="mt-1 text-sm italic text-black/45">
              Come to as much or as little of it as you like.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {events.map((event, index) => (
              <EventCard key={`${event.sort_order}-${event.title}`} event={event} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
