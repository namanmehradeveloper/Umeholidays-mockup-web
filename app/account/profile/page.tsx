'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  History,
  IdCard,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';

import { apiFetch } from '../../../lib/api';

/* =========================================================
   TYPES
========================================================= */

type UserProfile = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

type ProfileForm = {
  name: string;
  phone: string;
};

type IconType = typeof User;

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getInitials(name?: string) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatRole(role?: string) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function Page() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [copied, setCopied] = useState<'email' | 'id' | null>(null);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiFetch<UserProfile>('/auth/me');

        if (!mounted) {
          return;
        }

        const profile = response.data ?? null;

        setUser(profile);

        setForm({
          name: profile?.name || '',
          phone: profile?.phone || '',
        });

        localStorage.setItem('ume_user', JSON.stringify(profile));
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Unable to load profile';

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setMessage('');
    setError('');
    setSaving(true);

    try {
      const response = await apiFetch<UserProfile>('/auth/me', {
        method: 'PATCH',
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
        },
      });

      const profile = response.data ?? null;

      setUser(profile);

      setForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
      });

      localStorage.setItem('ume_user', JSON.stringify(profile));

      setMessage('Profile updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update profile';

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     COPY
  ======================================================= */

  const copyValue = async (type: 'email' | 'id', value: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      window.setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    );
  }

  /* =======================================================
     LOAD ERROR
  ======================================================= */

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#ece7e2] bg-white px-6 py-14 text-center shadow-[0_12px_40px_rgba(27,25,23,0.05)] sm:px-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} strokeWidth={1.7} />
          </div>

          <h1 className="mt-5 font-serif text-3xl tracking-[-0.02em] text-[#1b1917]">
            Unable to load profile
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#746d67]">
            {error || 'Please refresh the page and try again.'}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={primaryButtonClass}
            >
              Try again
            </button>

            <Link href="/account" className={secondaryButtonClass}>
              Back to account
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const accountId = user.id || user._id;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <PageShell>
      {/* =================================================
          HEADER
      ================================================= */}

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#8a837c]">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-[#a35b36]"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          My account
        </Link>

        <ChevronRight size={12} className="text-[#c9c1b9]" />

        <span aria-current="page" className="font-medium text-[#1b1917]">
          Profile
        </span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a35b36]">
          Your UME
        </p>

        <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#1b1917] sm:text-5xl">
          Profile settings
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#746d67]">
          Manage your personal information and review your account details.
        </p>
      </header>

      {/* =================================================
          IDENTITY CARD
      ================================================= */}

      <section className="mt-8 overflow-hidden rounded-[28px] border border-[#ece7e2] bg-white shadow-[0_12px_40px_rgba(27,25,23,0.05)] sm:mt-10">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#f7f1e7] via-[#f2e2d4] to-[#e6c3aa] sm:h-36">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/35 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#b76b43]/10 blur-3xl" />

          <p className="absolute right-5 top-4 font-serif text-sm italic text-[#a35b36]/60 sm:right-8 sm:top-5">
            UME Holidays
          </p>
        </div>

        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-14 flex flex-col items-center gap-4 text-center sm:-mt-16 sm:flex-row sm:items-start sm:gap-6 sm:text-left">
            <Avatar user={user} />

            <div className="min-w-0 flex-1 sm:mt-[76px]">
              <h2 className="break-words font-serif text-2xl font-medium tracking-[-0.02em] text-[#1b1917] sm:text-3xl">
                {user.name}
              </h2>

              <p className="mt-1 break-all text-sm text-[#746d67]">{user.email}</p>

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#faf5f1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a35b36]">
                  <ShieldCheck size={13} strokeWidth={1.8} />
                  {formatRole(user.role)}
                </span>

                <StatusPill active={user.isActive} />
              </div>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-1 gap-3 border-t border-[#f0ebe6] pt-6 sm:grid-cols-3 sm:gap-4">
            <Stat icon={CalendarDays} label="Member since" value={formatDate(user.createdAt)} />
            <Stat icon={Clock3} label="Last login" value={formatDateTime(user.lastLoginAt)} />
            <Stat icon={History} label="Last updated" value={formatDateTime(user.updatedAt)} />
          </dl>
        </div>
      </section>

      {/* =================================================
          CONTENT GRID
      ================================================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ===============================================
            PERSONAL INFORMATION
        =============================================== */}

        <section className="overflow-hidden rounded-[28px] border border-[#ece7e2] bg-white shadow-[0_12px_40px_rgba(27,25,23,0.04)]">
          <CardHeader
            icon={User}
            title="Personal information"
            description="Update the contact details we use for your bookings and enquiries."
          />

          <form onSubmit={save} className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Field label="Full name" icon={User} htmlFor="profile-name" required>
                <input
                  id="profile-name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </Field>

              <Field label="Phone / WhatsApp" icon={Phone} htmlFor="profile-phone">
                <input
                  id="profile-phone"
                  type="tel"
                  maxLength={20}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field
                  label="Email address"
                  icon={Mail}
                  htmlFor="profile-email"
                  hint="Your email is used to sign in and can't be changed here."
                >
                  <input
                    id="profile-email"
                    readOnly
                    value={user.email || ''}
                    className={`${inputClass} cursor-default border-[#efeae5] bg-[#faf8f6] pr-24 text-[#6f6862] hover:border-[#efeae5] focus:ring-0`}
                  />

                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <Lock size={13} className="mr-1 text-[#b9b1a9]" aria-hidden />

                    <button
                      type="button"
                      onClick={() => copyValue('email', user.email)}
                      title="Copy email"
                      aria-label="Copy email"
                      className="grid h-9 w-9 place-items-center rounded-lg text-[#8a837c] transition-colors hover:bg-white hover:text-[#b76b43]"
                    >
                      {copied === 'email' ? (
                        <Check size={15} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* Alerts */}

            <div aria-live="polite">
              {message && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}

            <div className="mt-8 flex flex-col-reverse gap-4 border-t border-[#f0ebe6] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#9a928b]">
                Fields marked <span className="text-[#b76b43]">*</span> are required.
              </p>

              <button
                type="submit"
                disabled={saving}
                className={`${primaryButtonClass} w-full sm:w-auto`}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ===============================================
            SIDEBAR
        =============================================== */}

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-[#ece7e2] bg-white shadow-[0_12px_40px_rgba(27,25,23,0.04)]">
            <CardHeader
              icon={IdCard}
              title="Account details"
              description="System-managed information."
              compact
            />

            <dl className="divide-y divide-[#f0ebe6] px-5 sm:px-6">
              <DetailRow label="Status">
                <StatusPill active={user.isActive} />
              </DetailRow>

              <DetailRow label="Account role">
                <span className="text-sm font-medium text-[#3f3a36]">{formatRole(user.role)}</span>
              </DetailRow>

              <div className="py-4">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a928b]">
                  Unique account ID
                </dt>

                <dd className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-xl bg-[#faf8f6] px-3 py-2.5 font-mono text-[11px] leading-5 text-[#514b46]">
                    {accountId}
                  </code>

                  <button
                    type="button"
                    onClick={() => copyValue('id', accountId)}
                    title="Copy account ID"
                    aria-label="Copy account ID"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#e6e0da] bg-white text-[#645d57] transition-all hover:border-[#b76b43]/40 hover:text-[#a35b36]"
                  >
                    {copied === 'id' ? (
                      <Check size={15} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </dd>
              </div>
            </dl>
          </section>

          <Link
            href="/account/password"
            className="group flex items-start gap-4 rounded-[24px] border border-[#ece7e2] bg-[#faf6f2] p-5 transition-all hover:-translate-y-0.5 hover:border-[#b76b43]/30 hover:bg-white hover:shadow-[0_16px_38px_rgba(27,25,23,0.07)] sm:p-6"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
              <KeyRound size={18} strokeWidth={1.7} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-serif text-xl text-[#1b1917]">Password & security</span>
              <span className="mt-1 block text-sm leading-6 text-[#746d67]">
                Update the password used to sign in to your account.
              </span>
            </span>

            <ArrowUpRight
              size={17}
              className="mt-1 shrink-0 text-[#b76b43] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}

/* =========================================================
   LAYOUT
========================================================= */

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white px-4 pb-20 pt-28 text-[#1b1917] sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

function CardHeader({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: IconType;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 border-b border-[#f0ebe6] ${
        compact ? 'px-5 py-5 sm:px-6' : 'px-5 py-5 sm:px-8 sm:py-6'
      }`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#faf6f2] text-[#b76b43]">
        <Icon size={18} strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <h2 className={`font-serif font-medium text-[#1b1917] ${compact ? 'text-xl' : 'text-2xl'}`}>
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#8a837c] sm:text-[13px]">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ user }: { user: UserProfile }) {
  return (
    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full rounded-full border-[5px] border-white object-cover shadow-[0_14px_34px_rgba(27,25,23,0.16)]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full border-[5px] border-white bg-[#f7efe9] font-serif text-4xl text-[#b76b43] shadow-[0_14px_34px_rgba(27,25,23,0.12)]">
          {getInitials(user.name)}
        </div>
      )}

      <span
        title={user.isActive ? 'Active account' : 'Inactive account'}
        className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-white sm:bottom-2.5 sm:right-2.5 ${
          user.isActive ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
    </div>
  );
}

/* =========================================================
   SMALL PARTS
========================================================= */

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
        active
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {active ? 'Active account' : 'Inactive account'}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#faf8f6] px-4 py-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#b76b43] shadow-[0_2px_8px_rgba(27,25,23,0.04)]">
        <Icon size={16} strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a928b]">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-[#3f3a36]">{value}</dd>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a928b]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  icon: IconType;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-1 text-xs font-semibold text-[#4a443f]"
      >
        {label}
        {required && <span className="text-[#b76b43]">*</span>}
      </label>

      <div className="relative">
        <Icon
          size={16}
          strokeWidth={1.7}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#b5aca4]"
        />
        {children}
      </div>

      {hint && <p className="mt-2 text-xs leading-5 text-[#9a928b]">{hint}</p>}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProfileSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading profile">
      <div className="h-3 w-40 rounded-full bg-[#f1ece7]" />
      <div className="mt-8 h-3 w-24 rounded-full bg-[#f1ece7]" />
      <div className="mt-4 h-10 w-64 max-w-full rounded-xl bg-[#f1ece7]" />

      <div className="mt-10 overflow-hidden rounded-[28px] border border-[#ece7e2]">
        <div className="h-28 bg-[#f7f1e7] sm:h-36" />
        <div className="relative px-5 pb-8 sm:px-8">
          <div className="-mt-14 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-start sm:gap-6">
            <div className="h-28 w-28 rounded-full border-[5px] border-white bg-[#efe7e0] sm:h-32 sm:w-32" />
            <div className="space-y-3 sm:mt-[76px]">
              <div className="h-6 w-48 rounded-lg bg-[#f1ece7]" />
              <div className="h-3 w-36 rounded-full bg-[#f1ece7]" />
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[68px] rounded-2xl bg-[#faf8f6]" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[420px] rounded-[28px] border border-[#ece7e2] bg-white" />
        <div className="h-[300px] rounded-[28px] border border-[#ece7e2] bg-white" />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#9a928b]">
        <Loader2 size={15} className="animate-spin text-[#b76b43]" />
        Loading profile…
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  'min-h-[50px] w-full rounded-2xl border border-[#e4ded8] bg-white py-3 pl-11 pr-4 text-sm text-[#1b1917] outline-none transition-all duration-200 placeholder:text-[#1b1917]/30 hover:border-[#d5ccc4] focus:border-[#b76b43] focus:ring-4 focus:ring-[#b76b43]/[0.08]';

const primaryButtonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#b76b43] px-7 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_rgba(183,107,67,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9d5735] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b76b43]/20 disabled:pointer-events-none disabled:opacity-50';

const secondaryButtonClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#e6e0da] bg-white px-7 text-[11px] font-bold uppercase tracking-[0.12em] text-[#645d57] transition-all duration-200 hover:border-[#b76b43]/40 hover:text-[#a35b36]';
