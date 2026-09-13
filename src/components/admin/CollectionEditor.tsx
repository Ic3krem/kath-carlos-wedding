'use client';

import { useState } from 'react';
import type { CollectionSpec, Row } from '@/lib/admin/schema';
import { emptyRow } from '@/lib/admin/schema';
import { FieldList } from './FieldInput';

interface CollectionEditorProps {
  spec: CollectionSpec;
  initial: Row[];
}

/**
 * List editor for any table described by a CollectionSpec: expand a row to edit
 * it in place, save or delete it, or add a new one from the form at the end.
 */
export function CollectionEditor({ spec, initial }: CollectionEditorProps) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row>(() => emptyRow(spec.fields, initial.length * 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/admin/collections/${spec.table}`;

  function updateRow(id: string, key: string, value: unknown) {
    setRows((curr) => curr.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  async function saveRow(row: Row) {
    setBusy(true);
    setError(null);
    const response = await fetch(`${base}/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    setBusy(false);
    if (!response.ok) {
      setError('Could not save that change.');
      return;
    }
    const saved = (await response.json()) as Row;
    setRows((curr) => curr.map((r) => (r.id === saved.id ? saved : r)).sort(bySortOrder));
    setOpenId(null);
  }

  async function deleteRow(id: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`${base}/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!response.ok) {
      setError('Could not delete that row.');
      return;
    }
    setRows((curr) => curr.filter((row) => row.id !== id));
  }

  async function addRow(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!response.ok) {
      setError('Could not add that. If this table is new, run the migration in Supabase first.');
      return;
    }
    const created = (await response.json()) as Row;
    setRows((curr) => [...curr, created].sort(bySortOrder));
    setDraft(emptyRow(spec.fields, (rows.length + 1) * 10));
  }

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{spec.title}</h2>
        <p className="text-sm text-black/60">{spec.description}</p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          const id = String(row.id);
          const isOpen = openId === id;
          return (
            <li key={id} className="rounded-md border border-black/10">
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  <strong className="break-words">{String(row[spec.titleKey] || 'Untitled')}</strong>
                  {spec.subtitleKey && row[spec.subtitleKey] ? (
                    <span className="text-black/60"> — {String(row[spec.subtitleKey])}</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 gap-3">
                  <button type="button" onClick={() => setOpenId(isOpen ? null : id)} className="text-sm underline">
                    {isOpen ? 'Close' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => deleteRow(id)} disabled={busy} className="text-sm text-red-600">
                    Delete
                  </button>
                </span>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-3 border-t border-black/10 p-3">
                  <FieldList fields={spec.fields} row={row} onChange={(key, value) => updateRow(id, key, value)} />
                  <button
                    type="button"
                    onClick={() => saveRow(row)}
                    disabled={busy}
                    className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit"
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="text-sm text-black/60">Nothing here yet — the site is showing its sample content.</li>}
      </ul>

      <form onSubmit={addRow} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h3 className="text-base font-semibold">{spec.addLabel}</h3>
        <FieldList
          fields={spec.fields}
          row={draft}
          onChange={(key, value) => setDraft((curr) => ({ ...curr, [key]: value }))}
        />
        <button type="submit" disabled={busy} className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
          {spec.addLabel}
        </button>
      </form>
    </section>
  );
}

function bySortOrder(a: Row, b: Row) {
  return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
}
