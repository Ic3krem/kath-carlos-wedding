import type { Settings } from '@/lib/types';
import { RsvpTrigger } from './RsvpTrigger';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <header
      className="relative flex h-[70vh] min-h-[420px] w-full items-center justify-center bg-cover bg-center px-4 text-center sm:h-[85vh]"
      style={{ backgroundImage: settings.hero_image_url ? `url(${settings.hero_image_url})` : undefined }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex flex-col items-center gap-6">
        <h1 className="font-script text-5xl text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
          {settings.couple_names}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#our-story" className="rounded-lg bg-white px-6 py-3 font-metropolis font-semibold uppercase text-[#170E01]">
            Get Started
          </a>
          <RsvpTrigger />
        </div>
      </div>
    </header>
  );
}
