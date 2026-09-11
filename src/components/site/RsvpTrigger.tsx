'use client';

import { useRsvpModal } from '@/lib/rsvp-modal-context';

export function RsvpTrigger({ className }: { className?: string }) {
  const { openModal } = useRsvpModal();
  return (
    <button onClick={openModal} className={className ?? 'rounded-lg bg-white px-6 py-3 font-semibold text-black'}>
      RSVP
    </button>
  );
}
