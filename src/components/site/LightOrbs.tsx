/** Soft glowing orbs that drift up the page like dust in sunlight. CSS only. */
const ORBS = [
  { x: 12, y: 70, s: 90, dur: 28, delay: 0, dx: 60, dy: -160, peak: 0.45 },
  { x: 46, y: 85, s: 120, dur: 32, delay: 9, dx: 80, dy: -200, peak: 0.3 },
  { x: 62, y: 20, s: 70, dur: 26, delay: 3, dx: -60, dy: -100, peak: 0.4 },
  { x: 78, y: 60, s: 100, dur: 30, delay: 12, dx: 50, dy: -180, peak: 0.35 },
  { x: 90, y: 35, s: 55, dur: 22, delay: 7, dx: -30, dy: -140, peak: 0.45 },
];

export function LightOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="light-orb"
          style={
            {
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.s,
              height: o.s,
              '--dur': `${o.dur}s`,
              '--delay': `${o.delay}s`,
              '--dx': `${o.dx}px`,
              '--dy': `${o.dy}px`,
              '--peak': o.peak,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
