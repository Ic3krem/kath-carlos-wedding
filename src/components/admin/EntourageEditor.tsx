'use client';

import { useState } from 'react';
import type { EntourageMember, EntourageCategory, EntourageSide } from '@/lib/types';

const CATEGORIES: EntourageCategory[] = ['parents', 'godparents', 'other'];
const SIDES: NonNullable<EntourageSide>[] = ['bride', 'groom'];

export function EntourageEditor({ initial }: { initial: EntourageMember[] }) {
  const [members, setMembers] = useState(initial);
  const [draft, setDraft] = useState({ category: 'parents' as EntourageCategory, role_label: '', name: '', side: null as EntourageSide, sort_order: initial.length });

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/admin/entourage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (response.ok) {
      const created = await response.json();
      setMembers([...members, created]);
      setDraft({ category: 'parents', role_label: '', name: '', side: null, sort_order: members.length + 1 });
    }
  }

  async function removeMember(id: string) {
    const response = await fetch(`/api/admin/entourage/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setMembers(members.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member.id} className="flex flex-col justify-between gap-2 rounded-md border border-black/10 p-3 sm:flex-row sm:items-center">
            <span>
              <strong>{member.role_label}</strong> — {member.name} ({member.category}{member.side ? `, ${member.side}` : ''})
            </span>
            <button onClick={() => removeMember(member.id)} className="text-sm text-red-600">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={addMember} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Add member</h2>
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as EntourageCategory })} className="rounded-md border border-black/20 px-3 py-2">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Role (e.g. Mother of the Bride)" value={draft.role_label} onChange={(e) => setDraft({ ...draft, role_label: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
        <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
        <select value={draft.side ?? ''} onChange={(e) => setDraft({ ...draft, side: (e.target.value || null) as EntourageSide })} className="rounded-md border border-black/20 px-3 py-2">
          <option value="">No side</option>
          {SIDES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
          Add
        </button>
      </form>
    </div>
  );
}
