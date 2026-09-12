import type { Settings } from '@/lib/types';
import { marckScript, poppins } from '@/lib/fonts';
import { RsvpTrigger } from './RsvpTrigger';

// Design frame: 1404 x 789.75. Hero height is set per breakpoint (measured from
// the reference screenshots) and the background group derives its width from
// that height at the frame's natural ratio — so the photo keeps its own scale
// and crops horizontally instead of being squeezed into the viewport width.
const FRAME_RATIO = '1404 / 789.75';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <div className="w-full overflow-hidden bg-black">
      <div className="relative h-[548px] w-full overflow-hidden md:h-[625px] lg:h-[790px]">
        {/* Layers 2 + 3 — grouped background, height-driven, never width-capped */}
        <div
          className="absolute left-1/2 top-0 h-full w-auto min-w-full -translate-x-1/2"
          style={{ aspectRatio: FRAME_RATIO }}
        >
          {settings.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/layer3.png" alt="" className="absolute inset-0 h-full w-full object-cover" />

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, #D9D9D9 0%, rgba(158.64, 158.64, 158.64, 0.17) 57%, rgba(115, 115, 115, 0) 100%)',
            }}
          />

          {/* Layer 0 — couple cutout, in front, tracks the temple with the background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/couple.png"
            alt=""
            className="absolute object-contain"
            style={{ left: '44.94%', top: '36.1%', width: '10.83%', height: '13.09%' }}
          />
        </div>

        {/* Layer 1 — couple names, in front, scaled to the viewport per breakpoint */}
        <div className="absolute left-0 w-full px-3 text-center" style={{ top: '20.39%' }}>
          <h1
            className="text-[40px] leading-none text-white sm:text-[64px] md:text-[88px] lg:text-[147.73px]"
            style={{ fontFamily: marckScript.style.fontFamily, textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)' }}
          >
            {settings.couple_names}
          </h1>
        </div>

        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 sm:gap-3"
          style={{ top: '62.4%', fontFamily: poppins.style.fontFamily }}
        >
          <a
            href="#our-story"
            className="flex h-[26px] w-[116px] items-center justify-center whitespace-nowrap rounded-[8.78px] bg-white text-[9.4px] font-semibold uppercase text-[#170E01] md:h-[32px] md:w-[143px] md:text-[11.6px] lg:h-[51.87px] lg:w-[237px] lg:text-[19.15px]"
          >
            Get Started
          </a>
          <RsvpTrigger className="flex h-[26px] w-[116px] items-center justify-center whitespace-nowrap rounded-[8.78px] bg-white text-[9.4px] font-semibold uppercase text-[#170E01] md:h-[32px] md:w-[143px] md:text-[11.6px] lg:h-[51.87px] lg:w-[237px] lg:text-[19.15px]" />
        </div>
      </div>
    </div>
  );
}
