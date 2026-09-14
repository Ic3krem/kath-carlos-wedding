import type { Logistics as LogisticsData, ThemeColor, ThemeDetails } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionIntro } from './SectionIntro';

interface LogisticsProps {
  logistics: Omit<LogisticsData, 'id'>;
  /** The dress code copy and palette already live with the theme content. */
  theme: Omit<ThemeDetails, 'id'>;
  colors: Pick<ThemeColor, 'name' | 'hex'>[];
}

const PANEL = 'rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8';

export function Logistics({ logistics, theme, colors }: LogisticsProps) {
  const notes = [
    { title: logistics.stay_title, body: logistics.stay_body },
    { title: logistics.travel_title, body: logistics.travel_body },
  ].filter((note) => note.title && note.body);

  const guests = [
    { label: 'Ladies', detail: theme.ladies_detail },
    { label: 'Gentlemen', detail: theme.gentlemen_detail },
  ].filter((guest) => guest.detail);

  return (
    <section
      id="logistics"
      className="flex w-full flex-col items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
    >
      <SectionIntro
        eyebrow="Practical guest notes"
        title="Logistics & Guest Guide"
        blurb="What to wear, where to sleep, and how to get to Mariveles."
      />

      <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-black/[0.02] p-6 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-8">
          {/* Dress code & palette */}
          <Reveal className={`${PANEL} space-y-4`}>
            <h3 className="text-lg text-black">
              {theme.headline || 'Dress Code'} <span className="text-accent">&amp; Palette</span>
            </h3>

            {(logistics.dress_note || theme.note) && (
              <p className="text-xs leading-relaxed text-black/60 sm:text-sm">
                {logistics.dress_note || theme.note}
              </p>
            )}

            {guests.length > 0 && (
              <ul className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                {guests.map((guest) => (
                  <li key={guest.label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                      {guest.label}
                    </span>
                    <span className="text-xs text-black/60">{guest.detail}</span>
                  </li>
                ))}
              </ul>
            )}

            {colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {colors.map((colour) => (
                  <div key={`${colour.name}-${colour.hex}`} className="flex items-center gap-2">
                    <span
                      className="h-6 w-6 rounded-full border border-black/10 shadow-sm transition-transform duration-500 hover:scale-110 motion-reduce:hover:scale-100"
                      style={{ backgroundColor: colour.hex }}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-black/50">
                      {colour.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Reveal>

          {/* Stay & travel */}
          {notes.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {notes.map((note, index) => (
                <Reveal
                  key={note.title}
                  from={index === 0 ? 'left' : 'right'}
                  delay={index * 120}
                  className={`${PANEL} space-y-3`}
                >
                  <h4 className="text-base text-black">{note.title}</h4>
                  <p className="text-xs leading-relaxed text-black/60">{note.body}</p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
