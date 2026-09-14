import type { Settings } from '@/lib/types';
import { marckScript, poppins } from '@/lib/fonts';

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
        width={1280}
        height={790}
        fetchPriority="high"
        className={`absolute inset-0 h-full w-full object-cover object-center ${className ?? ''}`}
      />
    </picture>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  return (
    <div className="w-full overflow-hidden bg-black">
      {/* One full viewport, on every device: the art is the whole first screen
          and the black countdown only appears once the guest scrolls. svh
          rather than vh so a phone's collapsing browser chrome cannot leave a
          strip of black under the photo. The layers are object-cover, so a
          tall phone crops the sides of the frame — the couple sits centred and
          survives that crop. */}
      <div className="relative h-[100svh] min-h-[470px] w-full overflow-hidden">
        {/* Layer frame — every design layer lives in this one container */}
        <div className="absolute inset-0">
          {settings.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.hero_image_url}
              alt=""
              width={1280}
              height={790}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
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

          {/* Transition — dissolves the foot of the hero into the black countdown */}
          <div
            className="absolute bottom-0 left-0 h-32 w-full sm:h-40 lg:h-48"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 57%, #000000 100%)',
            }}
          />

        </div>

        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 sm:gap-3"
          style={{ top: '62.4%', fontFamily: poppins.style.fontFamily }}
        >
          <a
            href="#our-story"
            className="relative flex h-[26px] w-[116px] items-center justify-center whitespace-nowrap rounded-[8.78px] bg-white text-[9.4px] font-semibold uppercase text-[#170E01] before:absolute before:-inset-y-[9px] before:inset-x-0 before:content-[''] md:h-[32px] md:w-[143px] md:text-[11.6px] md:before:-inset-y-[6px] lg:h-[51.87px] lg:w-[237px] lg:text-[19.15px] lg:before:inset-0"
          >
            Get Started
          </a>
        </div>
      </div>

    </div>
  );
}
