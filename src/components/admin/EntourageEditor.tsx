'use client';

import { useState } from 'react';
import type { EntourageMember, EntourageCategory, EntourageSide } from '@/lib/types';
import { ENTOURAGE_CATEGORIES, ENTOURAGE_CATEGORY_LABELS } from '@/lib/types';

const CATEGORIES = ENTOURAGE_CATEGORIES;
const SIDES: NonNullable<EntourageSide>[] = ['bride', 'groom'];
const INPUT_CLASS = 'rounded-md border border-black/20 px-3 py-2';

type Draft = Omit<EntourageMember, 'id'>;

const BLANK: Draft = { category: 'parents', role_label: '', name: '', side: null, sort_order: 0 };

export function EntourageEditor({ initial }: { initial: EntourageMember[] }) {
  const [members, setMembers] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ ...BLANK, sort_order: initial.length * 10 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patchMember(id: string, patch: Partial<EntourageMember>) {
    setMembers((curr) => curr.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch('/api/admin/entourage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (!response.ok) {
      setError('Something went wrong. Please try again.');
      return;
    }
    const created = (await response.json()) as EntourageMember;
    setMembers((curr) => [...curr, created].sort((a, b) => a.sort_order - b.sort_order));
    setDraft({ ...BLANK, category: draft.category, side: draft.side, sort_order: (members.length + 1) * 10 });
  }

  async function saveMember(member: EntourageMember) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/entourage/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    setBusy(false);
    if (!response.ok) {
      setError('Could not save that change.');
      return;
    }
    const saved = (await response.json()) as EntourageMember;
    setMembers((curr) => curr.map((m) => (m.id === saved.id ? saved : m)).sort((a, b) => a.sort_order - b.sort_order));
    setOpenId(null);
  }

  async function removeMember(id: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/entourage/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!response.ok) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setMembers((curr) => curr.filter((m) => m.id !== id));
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Entourage</h2>
        <p className="text-sm text-black/60">
          Groom-side members fill the left column and bride-side the right; leave the side blank for a centred role.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {members.map((member) => {
          const isOpen = openId === member.id;
          return (
            <li key={member.id} className="rounded-md border border-black/10">
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  <strong className="break-words">{member.role_label || 'Untitled'}</strong> — {member.name}
                  <span className="text-black/60">
                    {' '}
                    ({ENTOURAGE_CATEGORY_LABELS[member.category]}
                    {member.side ? `, ${member.side}` : ''})
                  </span>
                </span>
                <span className="flex shrink-0 gap-3">
                  <button type="button" onClick={() => setOpenId(isOpen ? null : member.id)} className="text-sm underline">
                    {isOpen ? 'Close' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => removeMember(member.id)} disabled={busy} className="text-sm text-red-600">
                    Remove
                  </button>
                </span>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-3 border-t border-black/10 p-3">
                  <MemberFields
                    value={member}
                    onChange={(patch) => patchMember(member.id, patch)}
                  />
                  <button
                    type="button"
                    onClick={() => saveMember(member)}
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
        {members.length === 0 && (
          <li className="text-sm text-black/60">No members yet — the site is showing its sample entourage.</li>
        )}
      </ul>

      <form onSubmit={addMember} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h3 className="text-base font-semibold">Add member</h3>
        <MemberFields value={draft} onChange={(patch) => setDraft((curr) => ({ ...curr, ...patch }))} />
        <button type="submit" disabled={busy} className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
          Add
        </button>
      </form>
    </div>
  );
}

function MemberFields({ value, onChange }: { value: Draft; onChange: (patch: Partial<Draft>) => void }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Group</label>
        <select
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value as EntourageCategory })}
          className={INPUT_CLASS}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {ENTOURAGE_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Role</label>
        <input
          placeholder="e.g. Mother of the Bride"
          value={value.role_label}
          onChange={(e) => onChange({ role_label: e.target.value })}
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name</label>
        <input value={value.name} onChange={(e) => onChange({ name: e.target.value })} className={INPUT_CLASS} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Side</label>
        <select
          value={value.side ?? ''}
          onChange={(e) => onChange({ side: (e.target.value || null) as EntourageSide })}
          className={INPUT_CLASS}
        >
          <option value="">No side</option>
          {SIDES.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Order</label>
        <input
          type="number"
          value={value.sort_order}
          onChange={(e) => onChange({ sort_order: Number(e.target.value) })}
          className={INPUT_CLASS}
        />
        <p className="text-xs text-black/50">Lower numbers appear first within the group.</p>
      </div>
    </>
  );
}
