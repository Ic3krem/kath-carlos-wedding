'use client';

import { useState } from 'react';
import type { Rsvp } from '@/lib/types';

function responseLabel(r: Rsvp) {
  if (r.proxy_name) return `Proxy: ${r.proxy_name}`;
  return r.attending ? 'Attending' : 'Declined';
}

export function RsvpTable({ rsvps: initial }: { rsvps: Rsvp[] }) {
  const [rsvps, setRsvps] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const attending = rsvps.filter((r) => r.attending);
  const seats = attending.reduce((sum, r) => sum + (r.guest_count || 0), 0);
  const declined = rsvps.length - attending.length;
  const proxies = rsvps.filter((r) => r.proxy_name).length;

  async function remove(r: Rsvp) {
    if (!window.confirm(`Remove the RSVP from ${r.name}? They will be able to RSVP again.`)) return;
    setBusy(r.id);
    setError(null);
    const response = await fetch(`/api/admin/rsvps/${r.id}`, { method: 'DELETE' });
    setBusy(null);
    if (response.ok) {
      setRsvps((curr) => curr.filter((x) => x.id !== r.id));
    } else {
      setError('Could not remove that RSVP. Please try again.');
    }
  }

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">RSVPs ({rsvps.length})</h1>
        <a href="/api/admin/rsvps/export" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Export CSV
        </a>
      </div>
      <p className="mb-4 rounded-md bg-black/5 px-4 py-3 text-sm">
        <strong>{seats}</strong> seats confirmed from <strong>{attending.length}</strong> attending
        {proxies > 0 && <> (including {proxies} sending a proxy)</>} · <strong>{declined}</strong> declined
      </p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Response</th>
            <th className="py-2 pr-4">Seats</th>
            <th className="py-2 pr-4">Companions</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Received</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.id} className="border-b border-black/5">
              <td className="py-2 pr-4 font-medium">{r.name}</td>
              <td className="py-2 pr-4">{responseLabel(r)}</td>
              <td className="py-2 pr-4">{r.attending ? r.guest_count : 0}</td>
              <td className="py-2 pr-4">{r.guest_names || '—'}</td>
              <td className="py-2 pr-4">{r.email || '—'}</td>
              <td className="py-2 pr-4 text-black/60">
                {new Date(r.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' })}
              </td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  onClick={() => remove(r)}
                  disabled={busy === r.id}
                  className="rounded border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  {busy === r.id ? 'Removing…' : 'Remove'}
                </button>
              </td>
            </tr>
          ))}
          {rsvps.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-black/50">
                No RSVPs yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
