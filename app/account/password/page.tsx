'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setMessage('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<any>('/auth/password', {
        method: 'PATCH',
        data: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });

      if (result.data?.token && result.data?.user) {
        localStorage.setItem('ume_token', result.data.token);
        localStorage.setItem(
          'ume_user',
          JSON.stringify(result.data.user)
        );
      }

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setMessage('Password updated successfully.');

      setTimeout(() => {
        router.push('/account');
      }, 500);
    } catch (e: any) {
      setError(
        e.message || 'Unable to update password'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-36">
      <div className="mx-auto max-w-md">
        <p className="text-[10px] uppercase tracking-[.25em] text-[#a35b36]">
          Account security
        </p>

        <h1 className="mt-2 font-serif text-5xl">
          Change password
        </h1>

        <form
          onSubmit={submit}
          className="mt-8 rounded-2xl border bg-white p-6"
        >
          <input
            required
            type="password"
            maxLength={128}
            placeholder="Current password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({
                ...form,
                currentPassword: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            required
            minLength={8}
            maxLength={128}
            type="password"
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({
                ...form,
                newPassword: e.target.value,
              })
            }
            className="mt-3 w-full rounded-xl border p-3"
          />

          <input
            required
            minLength={8}
            maxLength={128}
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
            className="mt-3 w-full rounded-xl border p-3"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[#b76b43] p-3 text-sm text-white disabled:opacity-50"
          >
            {loading
              ? 'Updating…'
              : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  );
}