import type { Rsvp } from '@/lib/types';

export function RsvpTable({ rsvps }: { rsvps: Rsvp[] }) {
  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">RSVPs ({rsvps.length})</h1>
        <a href="/api/admin/rsvps/export" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Export CSV
        </a>
      </div>
      <table className="min-w-[720px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Attending</th>
            <th className="py-2 pr-4">Guests</th>
            <th className="py-2 pr-4">Meal</th>
            <th className="py-2 pr-4">Message</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((rsvp) => (
            <tr key={rsvp.id} className="border-b border-black/5">
              <td className="py-2 pr-4">{rsvp.name}</td>
              <td className="py-2 pr-4">{rsvp.email}</td>
              <td className="py-2 pr-4">{rsvp.attending ? 'Yes' : 'No'}</td>
              <td className="py-2 pr-4">{rsvp.guest_count}</td>
              <td className="py-2 pr-4">{rsvp.meal_preference ?? '—'}</td>
              <td className="py-2 pr-4">{rsvp.message ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
