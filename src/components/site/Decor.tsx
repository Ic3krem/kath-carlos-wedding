/**
 * Two soft, blurred blobs behind a section that drift at different speeds as
 * the page scrolls, giving the flat bands some depth. The parent section
 * needs `relative isolate overflow-hidden`.
 */
export function Decor({ tone = 'light' }: { tone?: 'light' | 'mist' }) {
  const a = tone === 'mist' ? 'bg-white/60' : 'bg-mist/80';
  const b = tone === 'mist' ? 'bg-dusty/25' : 'bg-dusty/20';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div data-parallax="0.25" className={`absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl ${a}`} />
      <div data-parallax="-0.2" className={`absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-3xl ${b}`} />
    </div>
  );
}
