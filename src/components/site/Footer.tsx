import { formatYear } from '@/lib/date-utils';
import type { Settings } from '@/lib/types';

export function Footer({ settings }: { settings: Settings }) {
  const plainNames = settings.couple_names.replace('&', 'and');
  return (
    <footer className="bg-footer px-6 py-12 text-center text-white">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3">
        <div className="text-[30px] font-medium">{settings.couple_names}</div>
        <div className="text-base leading-relaxed">
          Ceremony · {settings.ceremony_name} · {settings.ceremony_address}
        </div>
        <div className="text-base leading-relaxed">
          Reception · {settings.reception_name} · {settings.reception_address}
        </div>
        <div className="mt-2 font-sans text-[11px] uppercase tracking-[0.25em] opacity-85">
          {plainNames} — {formatYear(settings.wedding_date)}
        </div>
        <a href="/florals/credits.txt" className="font-sans text-[10px] tracking-[0.1em] text-white/60 no-underline hover:text-white">
          Floral photo credits
        </a>
      </div>
    </footer>
  );
}
