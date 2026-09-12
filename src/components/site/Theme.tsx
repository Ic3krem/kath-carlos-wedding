import type { ThemeColor, ThemeDetails } from '@/lib/types';

interface ThemeProps {
  details: Omit<ThemeDetails, 'id'>;
  colors: Pick<ThemeColor, 'name' | 'hex'>[];
}

export function Theme({ details, colors }: ThemeProps) {
  const guests = [
    { label: 'Ladies', detail: details.ladies_detail },
    { label: 'Gentlemen', detail: details.gentlemen_detail },
  ].filter((guest) => guest.detail);

  return (
    <section id="theme" className="flex w-full flex-col items-center gap-6 px-4 py-5 sm:px-8 sm:py-7 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">Theme</h2>

      <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        {details.headline && <p className="text-2xl font-semibold text-black sm:text-3xl">{details.headline}</p>}
        {details.note && <p className="max-w-xl text-black/55">{details.note}</p>}
      </div>

      {guests.length > 0 && (
        <ul className="flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:justify-center sm:gap-10">
          {guests.map((guest) => (
            <li key={guest.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs uppercase tracking-wide text-black/40">{guest.label}</span>
              <span className="max-w-xs text-black/70">{guest.detail}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6">
        {colors.map((colour) => (
          <div key={`${colour.name}-${colour.hex}`} className="flex w-20 flex-col items-center gap-2">
            <span
              className="h-16 w-16 rounded-full border border-black/10 sm:h-20 sm:w-20"
              style={{ backgroundColor: colour.hex }}
            />
            <span className="text-xs font-medium text-black/70">{colour.name}</span>
            <span className="text-[10px] uppercase text-black/35">{colour.hex}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
