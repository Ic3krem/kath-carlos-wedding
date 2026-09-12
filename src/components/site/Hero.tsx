import type { Settings } from '@/lib/types';
import { RsvpTrigger } from './RsvpTrigger';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <header className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '1280 / 790' }}>
      {settings.hero_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-300/40 via-neutral-400/10 via-[57%] to-neutral-500/0" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/couple.png"
        alt=""
        className="absolute object-contain"
        style={{ left: '44.45%', top: '36.1%', width: '11.9%', height: '13.1%' }}
      />
      <div className="absolute text-center" style={{ left: '4.79%', top: '20.39%', width: '90.41%' }}>
        <h1
          className="font-script text-3xl text-white sm:text-5xl lg:text-8xl"
          style={{ textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)' }}
        >
          {settings.couple_names}
        </h1>
      </div>
      <div className="absolute left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 px-4" style={{ top: '62.4%' }}>
        <a href="#our-story" className="rounded-lg bg-white px-6 py-3 font-metropolis font-semibold uppercase text-[#170E01]">
          Get Started
        </a>
        <RsvpTrigger />
      </div>
    </header>
  );
}
