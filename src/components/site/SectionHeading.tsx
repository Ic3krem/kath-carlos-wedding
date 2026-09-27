interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Larger title, used by Entourage and Attire Guide. */
  large?: boolean;
}

/** Small uppercase eyebrow, script title, and the short rule under it. */
export function SectionHeading({ eyebrow, title, large = false }: SectionHeadingProps) {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col items-center gap-2 text-center">
      {eyebrow && <div className="font-sans text-[11px] uppercase tracking-[0.35em] text-label">{eyebrow}</div>}
      <h2
        className={`m-0 font-script font-normal leading-[1.1] text-ink ${
          large ? 'text-[clamp(48px,7vw,80px)]' : 'text-[clamp(44px,6vw,64px)]'
        }`}
      >
        {title}
      </h2>
      <div className="heading-rule mt-1.5 h-px w-[54px] bg-steel" />
    </div>
  );
}
