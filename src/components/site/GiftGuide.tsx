import type { GiftOption } from '@/lib/types';
import { Icon } from './Icons';
import { Decor } from './Decor';
import { Reveal } from './Reveal';

export function GiftGuide({ intro, options }: { intro: string; options: GiftOption[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-mist px-6 py-[88px]">
      <Decor tone="mist" />
      <Reveal className="mx-auto flex max-w-[720px] flex-col items-center gap-3.5 text-center">
        <span className="bob inline-block">
          <Icon name="gift" size={28} color="#4f6f8f" />
        </span>
        <h2 className="m-0 font-script text-[clamp(44px,6vw,64px)] font-normal leading-[1.1]">Gift Guide</h2>
        {intro.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="m-0 text-[19px] leading-relaxed text-body">
            {para}
          </p>
        ))}
        {options.length > 0 && (
          <div className="mt-4 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
            {options.map((o) => (
              <div key={o.id} className="lift flex flex-col gap-1.5 rounded-xl bg-white px-5 py-6 shadow-card">
                <h3 className="m-0 text-[22px] font-medium">{o.title}</h3>
                {o.detail && <p className="m-0 text-base text-body">{o.detail}</p>}
                {o.lines
                  .split('\n')
                  .filter(Boolean)
                  .map((line, i) => (
                    <span key={i} className="font-sans text-sm text-steel">
                      {line}
                    </span>
                  ))}
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
