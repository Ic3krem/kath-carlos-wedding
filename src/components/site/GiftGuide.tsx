import type { GiftOption } from '@/lib/types';

interface GiftGuideProps {
  intro: string;
  options: Pick<GiftOption, 'title' | 'detail' | 'lines'>[];
}

export function GiftGuide({ intro, options }: GiftGuideProps) {
  if (options.length === 0 && !intro) return null;

  return (
    <section id="gift-guide" className="flex w-full flex-col items-center gap-6 px-1.5 py-5 sm:px-3 sm:py-7 lg:px-6">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">Gift Guide</h2>
      {intro && <p className="max-w-2xl text-center text-black/55">{intro}</p>}

      <div className="grid w-full max-w-[1550px] grid-cols-1 gap-6 sm:grid-cols-3">
        {options.map((option) => (
          <div
            key={option.title}
            className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-black">{option.title}</h3>
            {option.detail && <p className="text-sm text-black/55">{option.detail}</p>}
            {option.lines && (
              <div className="mt-2 flex flex-col gap-0.5">
                {option.lines
                  .split('\n')
                  .filter(Boolean)
                  .map((line) => (
                    <span key={line} className="text-sm text-black/70">
                      {line}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
