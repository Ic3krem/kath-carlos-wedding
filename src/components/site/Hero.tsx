import type { Settings } from '@/lib/types';
import { marckScript, poppins } from '@/lib/fonts';
import { RsvpTrigger } from './RsvpTrigger';

// The design ships every layer at three frame sizes:
//   mobile 375x568, tablet 800x661, desktop 1280x790
// Each layer fills the frame, so they all crop identically and stay aligned.
function FrameLayer({ name, className }: { name: string; className?: string }) {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={`/hero/${name}-desktop.png`} />
      <source media="(min-width: 768px)" srcSet={`/hero/${name}-tablet.png`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/hero/${name}-mobile.png`}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-center ${className ?? ''}`}
      />
    </picture>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  return (
    <div className="w-full overflow-hidden bg-black">
      <div className="relative h-[568px] w-full overflow-hidden md:h-[661px] lg:h-[790px]">
        {/* Layer frame — every design layer lives in this one container */}
        <div className="absolute inset-0">
          {settings.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}

          {/* Layers 2 + 3 — grouped background */}
          <FrameLayer name="bg2" />
          <FrameLayer name="bg3" />

          {/* Layer 1 — couple names, behind the couple frame */}
          <div className="absolute left-0 w-full px-3 text-center" style={{ top: '20.39%' }}>
            <h1
              className="text-[40px] leading-none text-white sm:text-[56px] md:text-[88px] lg:text-[147.73px]"
              style={{ fontFamily: marckScript.style.fontFamily, textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)' }}
            >
              {settings.couple_names}
            </h1>
          </div>

          {/* Layer 0 — couple frame, in front of the title */}
          <FrameLayer name="couple" />
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

      {/* Transition band between the hero frame and the countdown */}
      <div
        className="h-24 w-full sm:h-28 lg:h-32"
        style={{
          background:
            'linear-gradient(180deg, #D9D9D9 0%, rgba(158.64, 158.64, 158.64, 0.17) 57%, rgba(115, 115, 115, 0) 100%)',
        }}
      />
    </div>
  );
}
