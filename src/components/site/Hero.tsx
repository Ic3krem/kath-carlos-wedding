import type { Settings } from '@/lib/types';
import { marckScript, poppins } from '@/lib/fonts';
import { RsvpTrigger } from './RsvpTrigger';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <div className="flex w-full flex-col items-center overflow-hidden bg-black pb-4 sm:pb-6 lg:pb-7">
      <div className="relative w-full" style={{ aspectRatio: '1404 / 789.75' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #D9D9D9 0%, rgba(158.64, 158.64, 158.64, 0.17) 57%, rgba(115, 115, 115, 0) 100%)',
          }}
        />
        {settings.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}

        <div
          className="absolute px-2 text-center sm:px-0"
          style={{ left: '8.78%', top: '20.39%', width: '82.4%' }}
        >
          <h1
            className="text-2xl leading-none text-white sm:text-5xl md:text-7xl lg:text-[147.73px]"
            style={{ fontFamily: marckScript.style.fontFamily, textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)' }}
          >
            {settings.couple_names}
          </h1>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/couple.png"
          alt=""
          className="absolute object-contain"
          style={{ left: '44.94%', top: '36.1%', width: '10.83%', height: '13.09%' }}
        />

        <div
          className="absolute flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 sm:gap-3"
          style={{ left: '50%', top: '62.4%', fontFamily: poppins.style.fontFamily }}
        >
          <a
            href="#our-story"
            className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold uppercase text-[#170E01] sm:px-6 sm:py-3 sm:text-base lg:text-[19.15px]"
          >
            Get Started
          </a>
          <RsvpTrigger className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold uppercase text-[#170E01] sm:px-6 sm:py-3 sm:text-base lg:text-[19.15px]" />
        </div>
      </div>
    </div>
  );
}
