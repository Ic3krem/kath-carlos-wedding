import { Reveal } from './Reveal';

/**
 * The reference layout opens every section the same way: a small tracked
 * eyebrow, the display heading, then one line of plain-language blurb.
 */
export function SectionIntro({
  eyebrow,
  title,
  blurb,
  tone = 'dark',
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  /** `light` is for the few sections that sit on a dark panel. */
  tone?: 'dark' | 'light';
}) {
  const heading = tone === 'light' ? 'text-white' : 'text-black';
  const body = tone === 'light' ? 'text-white/60' : 'text-black/55';

  return (
    <Reveal className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
        {eyebrow}
      </p>
      <h2 className={`heading-flourish font-script text-5xl sm:text-6xl lg:text-7xl ${heading}`}>{title}</h2>
      {blurb && <p className={`text-sm sm:text-base ${body}`}>{blurb}</p>}
    </Reveal>
  );
}

/** The small ornament the reference sets between sections. */
export function SectionDivider({ label = '❦' }: { label?: string }) {
  return (
    <div aria-hidden className="mx-auto flex w-full max-w-xs items-center justify-center gap-4 py-8">
      <span className="h-px flex-1 bg-black/12" />
      <span className="text-sm text-accent">{label}</span>
      <span className="h-px flex-1 bg-black/12" />
    </div>
  );
}
