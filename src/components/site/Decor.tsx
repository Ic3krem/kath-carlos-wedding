/**
 * Two soft, blurred blobs behind a section that drift at different speeds as
 * the page scrolls, giving the flat bands some depth. The parent section
 * needs `relative isolate overflow-hidden`.
 */
export function Decor({ tone = 'light' }: { tone?: 'light' | 'mist' }) {
  const a = tone === 'mist' ? 'rgba(255,255,255,0.7)' : 'rgba(220,231,240,0.9)';
  const b = tone === 'mist' ? 'rgba(138,164,187,0.28)' : 'rgba(138,164,187,0.22)';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        data-parallax="0.25"
        className="absolute -left-32 top-0 h-96 w-96"
        style={{ background: `radial-gradient(circle, ${a} 0%, transparent 65%)` }}
      />
      <div
        data-parallax="-0.2"
        className="absolute -right-28 -bottom-10 h-[26rem] w-[26rem]"
        style={{ background: `radial-gradient(circle, ${b} 0%, transparent 65%)` }}
      />
    </div>
  );
}
