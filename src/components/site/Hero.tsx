import { formatLongDate, formatTime, formatWeekday } from '@/lib/date-utils';
import type { Settings } from '@/lib/types';

export function Hero({ settings }: { settings: Settings }) {
  const image = settings.hero_image_url || '/hero/hero.webp';
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#3a4a58]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={settings.couple_names} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,30,40,0.35),rgba(20,30,40,0.5))]" />
      <div className="relative flex flex-col items-center gap-3.5 p-6 text-center text-white">
        <div className="font-sans text-xs font-medium uppercase tracking-[0.4em]">We are getting married</div>
        <h1 className="m-0 text-[clamp(62px,10.5vw,124px)] font-normal leading-[1.05] [word-spacing:0.18em]">
          {settings.couple_names}
        </h1>
        <div className="font-script text-[clamp(34px,4.4vw,50px)] leading-[1.2]">{formatLongDate(settings.wedding_date)}</div>
        <div className="font-sans text-[clamp(13px,1.6vw,17px)] font-medium uppercase tracking-[0.35em]">
          {formatWeekday(settings.wedding_date)} · {formatTime(settings.wedding_date)}
        </div>
        <a
          href="#rsvp"
          className="mt-[18px] rounded-full bg-white px-9 py-3 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-ink no-underline shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-colors hover:bg-haze"
        >
          RSVP
        </a>
      </div>
    </section>
  );
}
