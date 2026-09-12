// Placeholder dress code — replace with the couple's real attire guidance.
const DRESS_CODE = {
  headline: 'Formal / Filipiniana-inspired',
  note: 'We would love to see you in our colours. Kindly reserve white and ivory for the bride.',
  guests: [
    { label: 'Ladies', detail: 'Long dress or Filipiniana in any of the palette colours' },
    { label: 'Gentlemen', detail: 'Barong Tagalog with black slacks, or a formal suit' },
  ],
};

const PALETTE = [
  { name: 'Sage', hex: '#7C8C6B' },
  { name: 'Olive', hex: '#4F5D3A' },
  { name: 'Cream', hex: '#F2E9D8' },
  { name: 'Champagne', hex: '#D9C089' },
  { name: 'Terracotta', hex: '#B66A4A' },
];

export function Theme() {
  return (
    <section id="theme" className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-script text-5xl text-black sm:text-6xl lg:text-7xl">Theme</h2>

      <div className="flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <p className="text-2xl font-semibold text-black sm:text-3xl">{DRESS_CODE.headline}</p>
        <p className="max-w-xl text-black/55">{DRESS_CODE.note}</p>
      </div>

      <ul className="flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:justify-center sm:gap-10">
        {DRESS_CODE.guests.map((guest) => (
          <li key={guest.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs uppercase tracking-wide text-black/40">{guest.label}</span>
            <span className="max-w-xs text-black/70">{guest.detail}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6">
        {PALETTE.map((colour) => (
          <div key={colour.name} className="flex w-20 flex-col items-center gap-2">
            <span
              className="h-16 w-16 rounded-full border border-black/10 sm:h-20 sm:w-20"
              style={{ backgroundColor: colour.hex }}
            />
            <span className="text-xs font-medium text-black/70">{colour.name}</span>
            <span className="text-[10px] uppercase text-black/35">{colour.hex}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
