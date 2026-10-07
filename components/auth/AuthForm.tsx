'use client';

import axios from 'axios';
import Link from 'next/link';
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Camera, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

const inputClass =
  'w-full rounded-xl border border-[#e5ddd3] bg-white py-3 pl-11 pr-4 text-sm text-[#1b1917] outline-none transition placeholder:text-[#aaa29a] focus:border-[#b76b43] focus:ring-2 focus:ring-[#b76b43]/10';

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-[#4f4943]">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a39a91]" />
        {children}
      </div>
    </div>
  );
}

export default function AuthForm({
  mode,
  className = 'mx-auto max-w-md rounded-3xl border border-[#ebe4da] bg-white p-7 shadow-sm',
}: {
  mode: AuthMode;
  className?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [switchQuery, setSwitchQuery] = useState('');
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
    const next = safeNextPath();
    setSwitchQuery(next === '/account' ? '' : `?next=${encodeURIComponent(next)}`);
  }, []);

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
    <form onSubmit={submit} className={`space-y-4 ${className}`}>
      {mode === 'register' && (
        <Field id="auth-name" label="Full name" icon={User}>
          <input
            id="auth-name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Your full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={inputClass}
          />
        </Field>
      )}

      <Field id="auth-email" label="Email address" icon={Mail}>
        <input
          id="auth-email"
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className={inputClass}
        />
      </Field>

      <Field id="auth-password" label="Password" icon={Lock}>
        <input
          id="auth-password"
          required
          minLength={8}
          maxLength={128}
          type={showPassword ? 'text' : 'password'}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#8a8178] transition hover:bg-[#faf6f1] hover:text-[#a35b36]"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      {mode === 'register' && (
        <Field id="auth-phone" label="Mobile number" icon={Phone}>
          <input
            id="auth-phone"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            pattern="[6-9][0-9]{9}"
            title={PHONE_ERROR}
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: phoneDigits(event.target.value) })}
            className={inputClass}
          />
        </Field>
      )}

      {mode === 'register' && (
        <div>
          <span className="mb-2 block text-xs font-semibold text-[#4f4943]">
            Profile photo <span className="font-normal text-[#a39a91]">(optional)</span>
          </span>
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#d9cec2] bg-[#fcfaf7] p-3 transition hover:border-[#b76b43]/60 hover:bg-[#fffaf6]">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#b76b43]/10 text-[#a35b36]">
                <Camera size={18} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[#1b1917]">
                {avatar ? avatar.name : 'Upload a photo'}
              </span>
              <span className="block text-xs text-[#8a8178]">JPG, PNG, WEBP or GIF · max 5MB</span>
            </span>
            <input
              type="file"
              accept={AVATAR_TYPES.join(',')}
              onChange={chooseAvatar}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b76b43] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(183,107,67,0.18)] transition hover:bg-[#934f30] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
      </button>

      <p className="pt-2 text-center text-sm text-[#746c64]">
        {mode === 'login' ? 'New to UME Holidays?' : 'Already have an account?'}{' '}
        <Link
          href={`${mode === 'login' ? '/auth/register' : '/auth/login'}${switchQuery}`}
          className="font-semibold text-[#a35b36] hover:text-[#7f4327]"
        >
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </form>
  );
}
