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
    <Reveal from={index === 0 ? 'left' : 'right'} delay={index * 140} className="flex h-full flex-col gap-6">
      {/* The venue label sits plain above its map — only the map itself is tiled. */}
      <div className="space-y-1 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{venue.label}</span>
        {venue.name && <h3 className="font-script text-3xl text-black sm:text-4xl">{venue.name}</h3>}
        {venue.address && <p className="text-sm leading-relaxed text-black/55">{venue.address}</p>}
      </div>

      {venue.embedUrl && (
        <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-black/10 shadow-sm">
          <iframe
            src={venue.embedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${venue.label} map${venue.name ? ` — ${venue.name}` : ''}`}
          />
        </div>
      )}

      {link && (
        <div className="text-center">
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
    </Reveal>
  );
}

/** Simple keyword-matched line icons for the timeline cards. */
function eventIconPath(title: string) {
  const t = title.toLowerCase();
  if (t.includes('assembly') || t.includes('seat')) {
    return <path d="M4 19h16M6 19V9l6-4 6 4v10M9 19v-6h6v6" />;
  }
  if (t.includes('ceremon')) {
    return <path d="M12 3v6m0 0-4 12h8l-4-12ZM6 21h12" />;
  }
  if (t.includes('recept') || t.includes('cocktail') || t.includes('dinner')) {
    return <path d="M12 3v8m0 0a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Zm0 0v10M8 21h8" />;
  }
  if (t.includes('program') || t.includes('send') || t.includes('dance')) {
    return <path d="M9 19V6l10-2v13M9 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />;
  }
  return <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />;
}

function EventIcon({ title }: { title: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-6 w-6 stroke-accent"
      fill="none"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {eventIconPath(title)}
    </svg>
  );
}

function DateTimeBlock({ weddingDate }: { weddingDate: string }) {
  const date = new Date(weddingDate);
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });

  return (
    <Reveal className="mx-auto flex w-full max-w-xl flex-col items-center gap-2 rounded-3xl border-2 border-accent/40 bg-black/[0.03] px-8 py-10 text-center shadow-md sm:px-14">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">Date &amp; Time</span>
      <p className="font-script text-3xl text-black sm:text-4xl">{day}</p>
      <p className="text-sm text-black/60">
        {weekday} · {time} in the afternoon
      </p>
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
      <EventIcon title={event.title} />
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
      className="flex w-full flex-col items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
    >
      <SectionIntro title="The Details" blurb="Where to be, and when to be there." />

      <DateTimeBlock weddingDate={settings.wedding_date} />

      {/* Ceremony left, reception right — buildVenues keeps that order. */}
      <div className="grid w-full max-w-[1200px] grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        {venues.map((venue, index) => (
          <VenueCard key={venue.label} venue={venue} index={index} />
        ))}
      </div>

      {events.length > 0 && (
        <div className="w-full max-w-[1200px] space-y-10" id="itinerary">
          <Reveal className="mx-auto max-w-xl text-center">
            <h3 className="font-script text-3xl text-black sm:text-4xl">Wedding Timeline</h3>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {events.map((event, index) => (
              <EventCard key={`${event.sort_order}-${event.title}`} event={event} index={index} />
            ))}
          </div>

          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-xs italic leading-relaxed text-black/50">
              We will start the program promptly on the scheduled timeline, so we kindly ask that we arrive on time
              at each part of the celebration — your punctuality is greatly appreciated.
            </p>
          </Reveal>
        </div>
      )}
    </section>
  );
}
