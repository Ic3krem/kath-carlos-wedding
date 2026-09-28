import { layoutEntourage } from '@/lib/entourage';
import type { EntourageMember } from '@/lib/types';
import { Decor } from './Decor';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

function NameGroup({ title, names }: { title: string; names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="flex min-w-0 flex-col gap-1.5 px-1 py-2 sm:px-5">
      <h3 className="m-0 mb-1.5 font-script text-[22px] font-normal sm:text-[30px]">{title}</h3>
      {names.map((name, i) => (
        <span key={`${name}-${i}`} className="name-hover text-[15px] font-bold text-body sm:text-lg">
          {name}
        </span>
      ))}
    </div>
  );
}

function RoleGrid({ items }: { items: { role: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
      {items.map((item, i) => (
        <div key={`${item.name}-${i}`} className="flex flex-col gap-1">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-label">{item.role}</span>
          <span className="text-lg">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

export function Entourage({ members }: { members: Omit<EntourageMember, 'id'>[] }) {
  const e = layoutEntourage(members);
  const hasGodparents = e.godfathers.length > 0 || e.godmothers.length > 0;

  return (
    <section id="entourage" className="relative isolate overflow-hidden bg-mist px-6 py-[88px]">
      <Decor tone="mist" />
      <Reveal>
        <SectionHeading title="The Entourage" large />
      </Reveal>
      <div className="mx-auto mt-11 flex max-w-[880px] flex-col gap-[60px] text-center">
        {e.officiants.length > 0 && (
          <Reveal from="up" className="flex flex-col items-center gap-2">
            <h3 className="m-0 font-script text-[28px] font-normal sm:text-[34px]">Officiant</h3>
            {e.officiants.map((name) => (
              <span key={name} className="name-hover text-[15px] font-bold text-body sm:text-lg">
                {name}
              </span>
            ))}
          </Reveal>
        )}

        {(e.groomParents.length > 0 || e.brideParents.length > 0) && (
          <Reveal from="up" className="grid grid-cols-2 gap-3 sm:gap-5">
            <NameGroup title="Parents of the Groom" names={e.groomParents} />
            <NameGroup title="Parents of the Bride" names={e.brideParents} />
          </Reveal>
        )}

        {hasGodparents && (
          <Reveal from="up" className="flex flex-col items-center gap-4">
            <h3 className="m-0 font-script text-[28px] font-normal sm:text-[34px]">Life Godparents</h3>
            <div className="grid w-full max-w-[620px] grid-cols-2 gap-3 sm:gap-5">
              {[e.godfathers, e.godmothers].map((list, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-1.5 px-1 text-[14px] text-body sm:px-4 sm:text-[17px]">
                  {list.map((name) => (
                    <span key={name} className="name-hover font-bold">
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {(e.bridesBest.length > 0 || e.groomsBests.length > 0) && (
          <Reveal from="up" className="grid grid-cols-2 gap-3 sm:gap-5">
            <NameGroup title={e.groomsBests.length > 1 ? 'Groom’s Bests' : 'Groom’s Best'} names={e.groomsBests} />
            <NameGroup title="Bride’s Best" names={e.bridesBest} />
          </Reveal>
        )}

        {e.pairs.length > 0 && (
          <Reveal from="up" className="flex flex-col gap-[22px] font-bold">
            <div className="grid grid-cols-2 gap-3 font-script text-[24px] font-normal text-ink sm:gap-5 sm:text-[30px]">
              <span>Groomsmen</span>
              <span>Bridesmaid</span>
            </div>
            {e.pairs.map((pair, i) => (
              <Reveal key={`${pair.role}-${i}`} delay={i * 80} className="flex flex-col gap-1.5">
                {pair.role && <div className="text-[14px] italic text-label sm:text-base">{pair.role}</div>}
                <div className="grid grid-cols-2 gap-3 text-[15px] sm:gap-5 sm:text-lg">
                  <span className="name-hover">{pair.groomSide}</span>
                  <span className="name-hover">{pair.brideSide}</span>
                </div>
              </Reveal>
            ))}
          </Reveal>
        )}

        {e.bearers.length > 0 && (
          <Reveal from="up" className="flex flex-col gap-[18px]">
            <div className="font-script text-[28px] font-normal text-ink">To carry our symbol of Love, Treasure and Faith</div>
            <RoleGrid items={e.bearers} />
          </Reveal>
        )}

        {e.flowerGirls.length > 0 && (
          <Reveal from="up" className="flex flex-col items-center gap-2 font-bold">
            <div className="font-script text-[30px] font-normal text-ink">Flower Girls</div>
            {e.flowerGirls.map((name) => (
              <span key={name} className="name-hover text-lg">
                {name}
              </span>
            ))}
          </Reveal>
        )}

        {e.others.length > 0 && <RoleGrid items={e.others} />}
      </div>
    </section>
  );
}
