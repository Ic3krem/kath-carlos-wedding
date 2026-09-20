import type { EntourageCategory, EntourageMember } from '@/lib/types';
import { CEREMONY_SPONSOR_TITLES } from '@/lib/types';
import { Reveal } from './Reveal';
import { SectionIntro } from './SectionIntro';

type Member = Omit<EntourageMember, 'id'>;

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

  const bestMan = by(ordered, 'best_man');
  const maidOfHonor = by(ordered, 'maid_of_honor');
  const groomsmen = by(ordered, 'groomsmen');
  const bridesmaids = by(ordered, 'bridesmaids');

  const sponsors = by(ordered, 'ceremony_sponsors');
  const sponsorGroups = CEREMONY_SPONSOR_TITLES.map((title) => ({
    title,
    people: sponsors.filter((s) => s.role_label === title),
  })).filter((group) => group.people.length > 0);

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
      <SectionIntro title="The Entourage" blurb="The family and friends standing with us on the day." />

      <div className="flex w-full max-w-4xl flex-col gap-14">
        {/* Principal sponsors — a single combined list, no Ninong/Ninang subheadings. */}
        {(ninongs.length > 0 || ninangs.length > 0) && (
          <div className="space-y-6">
            <Reveal className="space-y-1 text-center">
              <h3 className={GROUP_TITLE}>Life Godparents</h3>
              <p className={GROUP_NOTE}>Our principal sponsors</p>
            </Reveal>
            <ul className="grid grid-cols-1 gap-3 text-center sm:grid-cols-2 sm:gap-x-10">
              {[...ninongs, ...ninangs].map((person) => (
                <li key={person.name} className="text-lg text-black">
                  {person.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ceremony sponsors — light / veil / cord, each a Mr.-and-Ms. pair. */}
        {sponsorGroups.length > 0 && (
          <div className="grid grid-cols-1 gap-10 border-t border-black/10 pt-10 sm:grid-cols-3">
            {sponsorGroups.map((group, index) => (
              <Reveal key={group.title} delay={index * 120} className="space-y-3 text-center">
                <h4 className="font-script text-xl text-black sm:text-2xl">{group.title}</h4>
                <ul className="space-y-1">
                  {group.people.map((person) => (
                    <li key={person.name} className="text-sm text-black/80">
                      {person.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        )}

        {/* Parents — plain text, no tiles. */}
        {(parents.bride.length > 0 || parents.groom.length > 0) && (
          <div className="grid grid-cols-1 gap-8 border-t border-black/10 pt-10 md:grid-cols-2">
            {(['groom', 'bride'] as const).map((side) =>
              parents[side].length > 0 ? (
                <Reveal key={side} className="space-y-1 text-center">
                  <span className={PILL}>Parents of the {side}</span>
                  {parents[side].map((parent) => (
                    <p key={parent.name} className="pt-1 text-lg text-black">
                      {parent.name}
                    </p>
                  ))}
                </Reveal>
              ) : null
            )}
          </div>
        )}

        {/* Groom's Bests & Bride's Best — plain text, no tiles. */}
        {(maidOfHonor.length > 0 || bestMan.length > 0) && (
          <div className="grid grid-cols-1 gap-8 border-t border-black/10 pt-10 md:grid-cols-2">
            {[
              { label: "Bride's Best", people: maidOfHonor, note: 'Beside the bride' },
              { label: "Groom's Bests", people: bestMan, note: 'Beside the groom' },
            ]
              .filter((role) => role.people.length > 0)
              .map((role) => (
                <Reveal key={role.label} className="space-y-1 text-center">
                  <span className={PILL}>{role.label}</span>
                  {role.people.map((person) => (
                    <p key={person.name} className="pt-1 text-lg text-black">
                      {person.name}
                    </p>
                  ))}
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
            {/* Flex rather than a fixed grid so a row of two or three items
                stays centred instead of stacking against the left edge. */}
            <div className="flex flex-wrap justify-center gap-8">
              {littles.map((little, index) => (
                <Reveal
                  key={little.category}
                  delay={index * 100}
                  className="w-full max-w-xs space-y-2 text-center sm:w-[calc(50%-1rem)] sm:max-w-none md:w-[calc(25%-1.5rem)]"
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
