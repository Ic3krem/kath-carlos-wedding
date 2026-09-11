import type { EntourageMember, EntourageCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<EntourageCategory, string> = {
  parents: 'Parents',
  godparents: 'Godparents',
  other: 'Entourage',
};

function groupByCategory(members: EntourageMember[]) {
  return members.reduce<Record<EntourageCategory, EntourageMember[]>>(
    (acc, member) => {
      acc[member.category] = [...(acc[member.category] ?? []), member];
      return acc;
    },
    { parents: [], godparents: [], other: [] }
  );
}

export function Entourage({ members }: { members: EntourageMember[] }) {
  const grouped = groupByCategory(members);

  return (
    <section className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Entourage</h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
        {(Object.keys(CATEGORY_LABELS) as EntourageCategory[]).map((category) => (
          <div key={category} className="flex flex-col items-center gap-3 text-center">
            <h3 className="text-xl font-semibold">{CATEGORY_LABELS[category]}</h3>
            <ul className="flex flex-col gap-1 text-black/70">
              {grouped[category].map((member) => (
                <li key={member.id}>
                  <span className="block text-sm text-black/50">{member.role_label}</span>
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
