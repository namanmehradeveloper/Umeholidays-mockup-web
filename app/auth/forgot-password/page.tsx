'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '../../../lib/api';

export default function Page() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/forgot-password', { method: 'POST', data: { email } });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 pt-36">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-5xl">Forgot password</h1>
        {sent ? (
          <p className="mt-5 text-sm">If an account exists for that email, password reset instructions have been sent.</p>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-2xl border bg-white p-6">
            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border p-3" />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="mt-4 w-full rounded-xl bg-[#b76b43] p-3 text-white disabled:opacity-50">
              {loading ? 'Sending…' : 'Request reset'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
