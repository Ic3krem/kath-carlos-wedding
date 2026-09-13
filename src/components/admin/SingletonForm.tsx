'use client';

import { useState } from 'react';
import type { Row, SingletonSpec } from '@/lib/admin/schema';
import { FieldList } from './FieldInput';

interface SingletonFormProps {
  spec: SingletonSpec;
  initial: Row;
}

/** Edits the single row of a one-row content table. */
export function SingletonForm({ spec, initial }: SingletonFormProps) {
  const [form, setForm] = useState<Row>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    const response = await fetch(`/api/admin/singletons/${spec.table}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{spec.title}</h2>
        <p className="text-sm text-black/60">{spec.description}</p>
      </header>
      <FieldList fields={spec.fields} row={form} onChange={(key, value) => setForm((curr) => ({ ...curr, [key]: value }))} />
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && (
        <p className="text-sm text-red-600">
          Failed to save. If this section is new, run the matching migration in Supabase first.
        </p>
      )}
    </form>
  );
}
