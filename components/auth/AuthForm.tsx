'use client';

import axios from 'axios';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { isValidPhone, PHONE_ERROR, phoneDigits } from '../../lib/phone';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

type AuthMode = 'login' | 'register';

type AuthResponse = {
  success?: boolean;
  data?: {
    token?: string;
    user?: Record<string, unknown>;
  };
  message?: string;
};

type WishlistSyncItem = {
  itemType: 'tour' | 'destination' | 'experience' | 'event' | 'story';
  slug: string;
};

const WISHLIST_TYPES = new Set<WishlistSyncItem['itemType']>([
  'tour',
  'destination',
  'experience',
  'event',
  'story',
]);

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || 'Authentication failed';
  }
  return error instanceof Error ? error.message : 'Authentication failed';
}

function safeNextPath() {
  if (typeof window === 'undefined') return '/account';

  const next = new URLSearchParams(window.location.search).get('next')?.trim();

  // Only allow an internal absolute path. This prevents open redirects such as
  // ?next=https://example.com or ?next=//example.com.
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/account';
  }

  return next;
}

function parseLocalWishlist(raw: string): WishlistSyncItem[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  const items: WishlistSyncItem[] = [];

  for (const value of parsed) {
    if (typeof value !== 'string' || !value.trim()) continue;

    const entry = value.trim();
    const separator = entry.indexOf(':');

    // Older builds stored tour wishlists as a bare slug. Keep those entries
    // compatible instead of treating the slug itself as an item type.
    if (separator === -1) {
      items.push({ itemType: 'tour', slug: entry });
      continue;
    }

    const rawType = entry.slice(0, separator) as WishlistSyncItem['itemType'];
    const slug = entry.slice(separator + 1).trim();

    if (WISHLIST_TYPES.has(rawType) && slug) {
      items.push({ itemType: rawType, slug });
    }
  }

  return items;
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview('');
      return;
    }
    const url = URL.createObjectURL(avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError('');

    if (file && !AVATAR_TYPES.includes(file.type)) {
      setError('Profile image must be a JPG, PNG, WEBP or GIF file.');
      event.target.value = '';
      return;
    }
    if (file && file.size > AVATAR_MAX_BYTES) {
      setError('Profile image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }
    setAvatar(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'register' && !isValidPhone(form.phone)) {
      setError(PHONE_ERROR);
      return;
    }
    setLoading(true);
    setError('');

    try {
      let payload: FormData | { email: string; password: string };

      if (mode === 'login') {
        payload = { email: form.email, password: form.password };
      } else {
        payload = new FormData();
        payload.append('name', form.name);
        payload.append('email', form.email);
        payload.append('password', form.password);
        payload.append('phone', form.phone);
        if (avatar) payload.append('avatar', avatar);
      }

      const response = await axios.post<AuthResponse>(`/api/auth/${mode}`, payload);
      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (!token || !user) {
        throw new Error('Authentication response is incomplete');
      }

      localStorage.setItem('ume_token', token);
      localStorage.setItem('ume_user', JSON.stringify(user));

      const rawWishlist = localStorage.getItem('ume-wishlist');

      if (rawWishlist) {
        try {
          const items = parseLocalWishlist(rawWishlist);

          if (items.length) {
            await axios.post(
              '/api/wishlist/sync',
              { items },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }

          localStorage.removeItem('ume-wishlist');
        } catch {
          // Login/register succeeded. Keep the local wishlist so a later sync
          // can retry instead of turning a successful authentication into an error.
        }
      }

      router.replace(safeNextPath());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md rounded-3xl border bg-white p-7 shadow-sm"
    >
      {mode === 'register' && (
        <input
          required
          minLength={2}
          maxLength={80}
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="mb-3 w-full rounded-xl border p-3"
        />
      )}

      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        className="mb-3 w-full rounded-xl border p-3"
      />

      <input
        required
        minLength={8}
        maxLength={128}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        className="mb-3 w-full rounded-xl border p-3"
      />

      {mode === 'register' && (
        <input
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="[6-9][0-9]{9}"
          title={PHONE_ERROR}
          placeholder="10-digit mobile number"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: phoneDigits(event.target.value) })}
          className="mb-3 w-full rounded-xl border p-3"
        />
      )}

      {mode === 'register' && (
        <label className="mb-3 flex cursor-pointer items-center gap-4 rounded-xl border p-3">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="Profile preview" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f4] text-xs text-[#a35b36]">
              Photo
            </span>
          )}
          <span className="flex-1 text-sm text-black/60">
            {avatar ? avatar.name : 'Profile image (optional, max 5MB)'}
          </span>
          <input
            type="file"
            accept={AVATAR_TYPES.join(',')}
            onChange={chooseAvatar}
            className="sr-only"
          />
        </label>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#b76b43] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
