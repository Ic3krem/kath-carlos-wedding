'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Login failed');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">Admin login</h1>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="w-full rounded-md border border-black/20 px-3 py-2"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
