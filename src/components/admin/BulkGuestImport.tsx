'use client';

import { useState } from 'react';

/** Parses "Name, 2" / "Name\t2" / "Name" lines; the number is companions allowed. */
export function parseGuestLines(text: string): { name: string; companions_allowed: number }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)[\s,;\t]+(\d{1,2})$/);
      const name = (match ? match[1] : line).replace(/[,;\t]+$/, '').trim();
      const companions = match ? Math.min(20, Number(match[2])) : 0;
      return { name, companions_allowed: companions };
    })
    .filter((row) => row.name.length > 0);
}

/** Paste many invitees at once instead of adding them one by one. */
export function BulkGuestImport({ existing }: { existing: string[] }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = parseGuestLines(text);
  const known = new Set(existing.map((n) => n.trim().toLowerCase().replace(/\s+/g, ' ')));
  const fresh = rows.filter((r) => !known.has(r.name.toLowerCase().replace(/\s+/g, ' ')));

  async function importAll() {
    setBusy(true);
    let added = 0;
    const failed: string[] = [];
    for (const [i, row] of fresh.entries()) {
      setStatus(`Adding ${i + 1} of ${fresh.length}…`);
      const response = await fetch('/api/admin/collections/invite_allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...row, sort_order: existing.length + i }),
      });
      if (response.ok) added++;
      else failed.push(row.name);
    }
    setBusy(false);
    if (failed.length) {
      setStatus(`Added ${added}. Could not add: ${failed.join(', ')}. If none were added, run migration 010 in Supabase first.`);
    } else {
      window.location.reload();
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
      <h3 className="text-base font-semibold">Paste a guest list</h3>
      <p className="text-sm text-black/60">
        One invitee per line, with the number of companions they can bring after a comma (leave it off for 0). Names already on the
        list are skipped.
      </p>
      <textarea
        className="min-h-40 rounded-md border border-black/20 px-3 py-2 font-mono text-sm"
        placeholder={'Maria Santos, 2\nJohn Reyes, 0\nAna Cruz, 1'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {rows.length > 0 && (
        <p className="text-sm text-black/60">
          {fresh.length} new · {rows.length - fresh.length} already on the list
        </p>
      )}
      <button
        type="button"
        onClick={importAll}
        disabled={busy || fresh.length === 0}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-40 sm:w-fit"
      >
        {busy ? 'Adding…' : `Add ${fresh.length || ''} guests`}
      </button>
      {status && <p className="text-sm text-black/70">{status}</p>}
    </section>
  );
}
