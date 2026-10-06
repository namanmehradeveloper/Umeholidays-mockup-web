'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function Page() {
  const router = useRouter();
  const [token, setToken] = useState('');
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('This reset link is missing a token.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', data: { token, password } });
      setDone(true);
      setTimeout(() => router.replace('/auth/login'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 pt-36">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-5xl">Reset password</h1>
        {done ? (
          <p className="mt-5">Password reset successfully. Redirecting to login…</p>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-2xl border bg-white p-6">
            <input required minLength={8} maxLength={128} type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border p-3" />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="mt-4 w-full rounded-xl bg-[#b76b43] p-3 text-white disabled:opacity-50">
              {loading ? 'Saving…' : 'Save password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
