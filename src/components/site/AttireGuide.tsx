import type { ThemeColor, ThemeDetails } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

interface AttireGuideProps {
  details: Omit<ThemeDetails, 'id'>;
  colors: Pick<ThemeColor, 'name' | 'hex'>[];
}

export function AttireGuide({ details, colors }: AttireGuideProps) {
  const guests = [details.guest_note, details.avoid_note, details.comfort_note].filter(Boolean).join(' ');
  return (
    <section id="guide" className="bg-paper px-6 pb-[88px] pt-[72px]">
      <Reveal>
        <SectionHeading title="Attire Guide" large />
      </Reveal>
      <Reveal className="mx-auto mt-8 flex max-w-[576px] flex-col gap-6 rounded-[18px] border border-[#d3dde6] bg-[#e6ecf1] p-[clamp(16px,4vw,36px)]">
        <div className="flex flex-col gap-3.5 rounded-[14px] border border-[#e1e9f0] bg-white px-6 py-[26px] shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/attire/attire-illustration.webp"
            alt="Two couples dressed in the wedding colours"
            loading="lazy"
            className="block w-full"
          />
          <div className="mt-2.5 grid grid-cols-1 gap-5 text-center sm:grid-cols-2 sm:gap-3">
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-steel px-3.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                Entourage
              </span>
              <p className="m-0 font-sans text-[11px] uppercase leading-relaxed text-muted">
                {details.life_godparents_detail && (
                  <>
                    <b>Life godparents:</b> {details.life_godparents_detail}
                    <br />
                  </>
                )}
                {details.godparents_gentlemen_detail && (
                  <>
                    <b>Gentlemen:</b> {details.godparents_gentlemen_detail}
                    <br />
                  </>
                )}
                {details.godparents_ladies_detail && (
                  <>
                    <b>Ladies:</b> {details.godparents_ladies_detail}
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-mist px-3.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-deep">
                Guests
              </span>
              <p className="m-0 max-w-[250px] font-sans text-[11px] uppercase leading-relaxed text-muted">{guests}</p>
            </div>
          </div>
          {details.note && <p className="m-0 text-center text-[13px] italic text-[#8a9aa8]">{details.note}</p>}
          <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-2.5 text-center font-sans text-[9px] font-medium uppercase tracking-[0.08em] text-muted">
            {colors.map((c) => (
              <div key={c.name + c.hex} className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  style={{ background: c.hex }}
                />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
