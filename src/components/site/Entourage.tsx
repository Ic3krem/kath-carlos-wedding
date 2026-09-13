import type { EntourageCategory, EntourageMember } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionIntro } from './SectionIntro';

type Member = Omit<EntourageMember, 'id'>;

const CARD = 'rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8';
const PILL =
  'inline-block rounded-full bg-black/[0.04] px-3.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-accent';
const GROUP_TITLE = 'font-script text-3xl text-black sm:text-4xl';
const GROUP_NOTE = 'text-[10px] font-semibold uppercase tracking-[0.2em] text-accent';

/** Small line icons for the bearers row — the reference uses Material Symbols. */
const ICONS: Partial<Record<EntourageCategory, React.ReactNode>> = {
  flower_girls: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5V5m0 14v-4.5M9.5 12H5m14 0h-4.5m-4.3-2.2L7 7m10 10-3.2-3.2m0-4.6L17 7M7 17l3.2-3.2" />
    </>
  ),
  ring_bearer: (
    <>
      <circle cx="12" cy="14" r="5.5" />
      <path d="m9 7 3-4 3 4" />
    </>
  ),
  coin_bearer: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v8m-2-6h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" />
    </>
  ),
  bible_bearer: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v15H6.5A1.5 1.5 0 0 0 5 20.5z" />
      <path d="M11.5 8.5h3M13 7v3" />
    </>
  ),
};

function Icon({ category }: { category: EntourageCategory }) {
  const glyph = ICONS[category];
  if (!glyph) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="mx-auto h-6 w-6 stroke-accent"
      fill="none"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph}
    </svg>
  );
}

function by(members: Member[], category: EntourageCategory, side?: 'bride' | 'groom') {
  return members.filter((m) => m.category === category && (side === undefined || m.side === side));
}

export function Entourage({ members }: { members: Member[] }) {
  const ordered = [...members].sort((a, b) => a.sort_order - b.sort_order);
  if (ordered.length === 0) return null;

  const parents = { bride: by(ordered, 'parents', 'bride'), groom: by(ordered, 'parents', 'groom') };
  const ninongs = by(ordered, 'godparents', 'groom');
  const ninangs = by(ordered, 'godparents', 'bride');
  // The reference presents principal sponsors as couples, so pair them off and
  // let any odd one out stand alone.
  const sponsorPairs = Array.from({ length: Math.max(ninongs.length, ninangs.length) }, (_, i) => ({
    ninong: ninongs[i],
    ninang: ninangs[i],
  }));

  const bestMan = by(ordered, 'best_man');
  const maidOfHonor = by(ordered, 'maid_of_honor');
  const groomsmen = by(ordered, 'groomsmen');
  const bridesmaids = by(ordered, 'bridesmaids');

  const LITTLES = [
    { category: 'flower_girls', heading: 'Flower Girls', note: 'Scattering petals down the aisle' },
    { category: 'ring_bearer', heading: 'Ring Bearer', note: 'Entrusted with the rings' },
    { category: 'coin_bearer', heading: 'Coin Bearer', note: 'Carrying the arrhae' },
    { category: 'bible_bearer', heading: 'Bible Bearer', note: 'Bearing the good book' },
  ] satisfies { category: EntourageCategory; heading: string; note: string }[];
  const littles = LITTLES.filter((little) => by(ordered, little.category).length > 0);

  const legacy = by(ordered, 'other');

  return (
    <section
      id="entourage"
      className="flex w-full max-w-[1200px] flex-col items-center gap-12 rounded-3xl border border-black/10 bg-black/[0.02] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <SectionIntro
        eyebrow="Chapter II • The wedding party"
        title="The Entourage"
        blurb="The family and friends standing with us on the day."
      />

      <div className="flex w-full max-w-4xl flex-col gap-14">
        {/* Parents */}
        {(parents.bride.length > 0 || parents.groom.length > 0) && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
            {(['bride', 'groom'] as const).map((side, index) =>
              parents[side].length > 0 ? (
                <Reveal
                  key={side}
                  from={index === 0 ? 'left' : 'right'}
                  delay={index * 120}
                  className={`${CARD} space-y-2 text-center`}
                >
                  <span className={PILL}>Parents of the {side}</span>
                  {parents[side].map((parent) => (
                    <p key={parent.name} className="pt-1 text-xl text-black sm:text-2xl">
                      {parent.name}
                    </p>
                  ))}
                </Reveal>
              ) : null
            )}
          </div>
        )}

        {/* Principal sponsors */}
        {sponsorPairs.length > 0 && (
          <div className="space-y-6 border-t border-black/10 pt-10">
            <Reveal className="space-y-1 text-center">
              <h3 className={GROUP_TITLE}>Life Godparents</h3>
              <p className={GROUP_NOTE}>Our principal sponsors</p>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {sponsorPairs.map((pair, index) => (
                <Reveal
                  key={`${pair.ninong?.name ?? ''}-${pair.ninang?.name ?? ''}`}
                  delay={(index % 2) * 100}
                  className="space-y-1 rounded-xl border border-black/10 bg-white p-6 text-center shadow-sm"
                >
                  {pair.ninong && <p className="text-lg text-black">{pair.ninong.name}</p>}
                  {pair.ninong && pair.ninang && <p className="font-script text-xl text-accent">&amp;</p>}
                  {pair.ninang && <p className="text-lg text-black">{pair.ninang.name}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Maid of honor & best man */}
        {(maidOfHonor.length > 0 || bestMan.length > 0) && (
          <div className="grid grid-cols-1 gap-6 border-t border-black/10 pt-10 md:grid-cols-2 md:gap-10">
            {[
              { label: 'Maid of Honor', people: maidOfHonor, note: 'Beside the bride' },
              { label: 'Best Man', people: bestMan, note: 'Beside the groom' },
            ]
              .filter((role) => role.people.length > 0)
              .map((role, index) => (
                <Reveal
                  key={role.label}
                  from={index === 0 ? 'left' : 'right'}
                  delay={index * 120}
                  className={`${CARD} space-y-3 text-center`}
                >
                  <span className={PILL}>{role.label}</span>
                  {role.people.map((person) => (
                    <h3 key={person.name} className="text-2xl text-black sm:text-3xl">
                      {person.name}
                    </h3>
                  ))}
                  <div className="mx-auto my-2 h-px w-12 bg-accent/40" />
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">{role.note}</p>
                </Reveal>
              ))}
          </div>
        )}

        {/* Bridesmaids & groomsmen */}
        {(bridesmaids.length > 0 || groomsmen.length > 0) && (
          <div className="grid grid-cols-1 gap-12 border-t border-black/10 pt-10 md:grid-cols-2 md:gap-16">
            {[
              { heading: 'The Bridesmaids', people: bridesmaids },
              { heading: 'The Groomsmen', people: groomsmen },
            ]
              .filter((column) => column.people.length > 0)
              .map((column, index) => (
                <Reveal
                  key={column.heading}
                  from={index === 0 ? 'left' : 'right'}
                  delay={index * 120}
                  className="space-y-6"
                >
                  <div className="space-y-1 border-b border-black/10 pb-2 text-center md:text-left">
                    <h3 className="font-script text-2xl text-black sm:text-3xl">{column.heading}</h3>
                  </div>
                  <ul className="space-y-4 text-center md:text-left">
                    {column.people.map((person) => (
                      <li key={person.name} className="space-y-0.5">
                        <p className="text-lg text-black">{person.name}</p>
                        <p className="text-xs text-black/45">{person.role_label}</p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
          </div>
        )}

        {/* Bearers & flower girls */}
        {littles.length > 0 && (
          <div className="space-y-6 border-t border-black/10 pt-10">
            <Reveal className="space-y-1 text-center">
              <h3 className={GROUP_TITLE}>Bearers &amp; Flower Girls</h3>
              <p className={GROUP_NOTE}>The little ones of the ceremony</p>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {littles.map((little, index) => (
                <Reveal
                  key={little.category}
                  delay={index * 100}
                  className="space-y-2 rounded-xl border border-black/10 bg-white p-6 text-center shadow-sm transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0"
                >
                  <Icon category={little.category} />
                  {by(ordered, little.category).map((person) => (
                    <h4 key={person.name} className="text-base text-black">
                      {person.name}
                    </h4>
                  ))}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                    {little.heading}
                  </p>
                  <p className="text-xs italic leading-relaxed text-black/50">{little.note}</p>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Anything added before the role categories existed still shows up. */}
        {legacy.length > 0 && (
          <div className="space-y-4 border-t border-black/10 pt-10 text-center">
            <Reveal className="space-y-4">
              <h3 className={GROUP_TITLE}>Entourage</h3>
              <ul className="space-y-2">
                {legacy.map((member) => (
                  <li key={`${member.sort_order}-${member.name}`}>
                    <span className={GROUP_NOTE}>{member.role_label}</span>
                    <p className="text-lg text-black">{member.name}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
