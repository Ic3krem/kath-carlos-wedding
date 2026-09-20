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

  const godparentsAttire = [
    { label: 'Gentlemen', detail: theme.godparents_gentlemen_detail },
    { label: 'Ladies', detail: theme.godparents_ladies_detail },
  ].filter((guest) => guest.detail);

  const guestAttire = [
    { label: 'Gentlemen and Ladies', detail: theme.gentlemen_detail },
    { label: '', detail: theme.ladies_detail },
  ].filter((guest) => guest.detail);

  return (
    <section
      id="logistics"
      className="flex w-full flex-col items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
    >
      <SectionIntro eyebrow="Practical guest notes" title="Logistics & Guest Guide" />

      <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-black/[0.02] p-6 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-8">
          {/* Dress code & palette */}
          <Reveal className={`${PANEL} space-y-5`}>
            <h3 className="text-lg text-black">
              {theme.headline || 'Wedding Attire Guidelines'}
            </h3>

            {/* Sample attire. The illustration is on white, so it sits on the
                panel without a frame; the webp is served where it is
                understood and the jpeg covers everything else. */}
            <figure className="space-y-2 pt-1">
              <picture>
                <source srcSet="/dress/attire.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dress/attire.jpg"
                  alt="Two couples in dusty blue: the gentlemen in a grey suit and in a white shirt with navy trousers, the ladies in long dusty blue dresses."
                  width={1600}
                  height={1013}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl"
                />
              </picture>
              <figcaption className="text-center text-[11px] italic text-black/45">
                A guide, not a uniform — anything in these colours is perfect.
              </figcaption>
            </figure>

            {colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 pt-1">
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

            {godparentsAttire.length > 0 && (
              <div className="space-y-2 border-t border-black/10 pt-4">
                <h4 className="text-sm font-semibold text-black">Godparents/Entourage</h4>
                {theme.note && <p className="text-xs leading-relaxed text-black/60">{theme.note}</p>}
                <ul className="flex flex-col gap-1 text-xs text-black/70">
                  {godparentsAttire.map((guest) => (
                    <li key={guest.label}>
                      <span className="font-medium text-black">{guest.label}:</span> {guest.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guestAttire.length > 0 && (
              <div className="space-y-2 border-t border-black/10 pt-4">
                <h4 className="text-sm font-semibold text-black">Guests</h4>
                {theme.guest_note && <p className="text-xs leading-relaxed text-black/60">{theme.guest_note}</p>}
                {theme.avoid_note && (
                  <p className="text-xs leading-relaxed text-black/70">
                    <strong className="font-semibold">{theme.avoid_note}</strong>
                  </p>
                )}
                {theme.comfort_note && (
                  <p className="text-xs leading-relaxed text-black/70">
                    <strong className="font-semibold">{theme.comfort_note}</strong>
                  </p>
                )}
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
