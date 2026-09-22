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
        // scale-110 hides the transparent halo blur leaves at the frame's edge
        className={`absolute inset-0 h-full w-full scale-110 object-cover object-center blur sm:blur-md ${className ?? ''}`}
      />
    </picture>
  );
}

function formatHeroDate(iso: string) {
  const date = new Date(iso);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
  return `${day} · ${weekday} · ${time}`;
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
              className="absolute inset-0 h-full w-full scale-110 object-cover blur sm:blur-md"
            />
          )}

          {/* Layers 2 + 3 — grouped background */}
          <FrameLayer name="bg2" />
          <FrameLayer name="bg3" />

          {/* Layer 0 — couple frame, blurred behind the centred text like the rest */}
          <FrameLayer name="couple" />

          {/* Transition — dissolves the foot of the hero into the light countdown panel */}
          <div
            className="absolute bottom-0 left-0 h-32 w-full sm:h-40 lg:h-48"
            style={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.35) 55%, var(--color-secondary) 100%)',
            }}
          />

        </div>

        {/* Centred within the artwork's empty lower band, not the whole
            frame — the top half is the temple/couple photo, so centring
            across the full height would push the text up into that art. */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 flex w-full flex-col items-center justify-center gap-4 px-[5%] text-center sm:max-w-md lg:max-w-4xl">
          {/* Date & time — script font, sitting above the title */}
          <p
            className="text-[18px] text-white sm:text-[23px] md:text-[27px]"
            style={{ fontFamily: marckScript.style.fontFamily, textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)' }}
          >
            {formatHeroDate(settings.wedding_date)}
          </p>

          {/* Title */}
          <h1
            className="mb-2 text-[40px] leading-none text-white sm:text-[56px] md:mb-4 md:text-[88px] lg:mb-6 lg:text-[100px]"
            style={{ fontFamily: marckScript.style.fontFamily, textShadow: '-2px 5px 5px rgba(0, 0, 0, 0.55)' }}
          >
            {settings.couple_names}
          </h1>

          <a
            href="#rsvp"
            className="relative flex h-[26px] w-[116px] items-center justify-center whitespace-nowrap rounded-[8.78px] bg-white text-[9.4px] font-semibold uppercase text-[#170E01] before:absolute before:-inset-y-[9px] before:inset-x-0 before:content-[''] md:h-[32px] md:w-[143px] md:text-[11.6px] md:before:-inset-y-[6px] lg:h-[51.87px] lg:w-[237px] lg:text-[19.15px] lg:before:inset-0"
          >
            RSVP
          </a>

          {settings.hero_message && (
            <p
              className="mt-2 max-w-md text-[11px] leading-relaxed text-white opacity-80 sm:text-sm md:text-base"
              style={{ fontFamily: poppins.style.fontFamily, textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)' }}
            >
              {settings.hero_message}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
