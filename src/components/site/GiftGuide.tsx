// Placeholder gift guide — replace with the couple's real details.
const INTRO =
  'Your presence on our wedding day is the greatest gift of all. But if you wish to honour us with something more, a contribution toward our new home together would mean the world.';

const OPTIONS = [
  {
    title: 'Monetary Gift',
    detail: 'A gift envelope may be dropped in the wishing well at the reception.',
    lines: ['BPI • 1234-5678-90', 'Account name: Kath Santos'],
  },
  {
    title: 'GCash',
    detail: 'For guests joining us from afar.',
    lines: ['+63 917 000 0001', 'Kath S.'],
  },
  {
    title: 'Registry',
    detail: 'A short list of things for our new home.',
    lines: ['registry.example.com/kath-carlos'],
  },
];

export function GiftGuide() {
  return (
    <section id="gift-guide" className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">Gift Guide</h2>
      <p className="max-w-2xl text-center text-black/55">{INTRO}</p>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <div
            key={option.title}
            className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-black">{option.title}</h3>
            <p className="text-sm text-black/55">{option.detail}</p>
            <div className="mt-2 flex flex-col gap-0.5">
              {option.lines.map((line) => (
                <span key={line} className="text-sm text-black/70">
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
