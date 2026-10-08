'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Heart,
  History,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Luggage,
  Mail,
  MessageSquareText,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';

import { apiFetch } from '../../../lib/api';
import { isValidPhone, PHONE_ERROR, phoneDigits } from '../../../lib/phone';

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
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [copied, setCopied] = useState<'email' | null>(null);

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
          phone: phoneDigits(profile?.phone || ''),
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
     DERIVED
  ======================================================= */

  const isDirty = useMemo(() => {
    if (!user) {
      return false;
    }

    return (
      form.name.trim() !== (user.name || '') ||
      form.phone !== phoneDigits(user.phone || '')
    );
  }, [form, user]);

  const completion = useMemo(() => {
    const checks = [
      { label: 'Full name', done: Boolean(user?.name) },
      { label: 'Email address', done: Boolean(user?.email) },
      { label: 'Phone / WhatsApp', done: Boolean(user?.phone) },
      { label: 'Profile photo', done: Boolean(user?.avatar) },
    ];

    const done = checks.filter((item) => item.done).length;

    return {
      checks,
      percent: Math.round((done / checks.length) * 100),
    };
  }, [user]);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (form.phone && !isValidPhone(form.phone)) {
      setError(PHONE_ERROR);
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
          phone: form.phone,
        },
      });

      const profile = response.data ?? null;

      setUser(profile);

      setForm({
        name: profile?.name || '',
        phone: phoneDigits(profile?.phone || ''),
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

  const resetForm = () => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name || '',
      phone: phoneDigits(user.phone || ''),
    });
    setMessage('');
    setError('');
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = async () => {
    setLoggingOut(true);

    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Local logout should still complete when the API is unavailable.
    }

    localStorage.removeItem('ume_token');
    localStorage.removeItem('ume_user');
    router.replace('/auth/login');
  };

  /* =======================================================
     COPY
  ======================================================= */

  const copyValue = async (type: 'email', value: string) => {
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

  const isOrganizer = user.role === 'organizer';

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <PageShell>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-[-0.03em] text-[#1b1917] sm:text-5xl">
            My profile
          </h1>
        </div>

        <p className="max-w-sm text-sm leading-6 text-[#746d67] sm:text-right">
          Keep your details up to date so our travel designers can reach you.
        </p>
      </header>

      {/* =================================================
          LAYOUT
      ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        {/* ===============================================
            SIDEBAR
        =============================================== */}

        <aside className="space-y-5 lg:sticky lg:top-28">
          {/* Identity */}

          <section className="overflow-hidden rounded-[26px] border border-[#ece7e2] bg-white shadow-[0_12px_40px_rgba(27,25,23,0.05)]">
            <div className="relative overflow-hidden bg-[#1b1917] px-6 pb-7 pt-8 text-center text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b76b43]/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#d98a61]/20 blur-3xl" />

              <div className="relative">
                <Avatar user={user} />

                <h2 className="mt-4 break-words font-serif text-2xl tracking-[-0.02em]">
                  {user.name}
                </h2>

                <p className="mt-1 break-all text-xs text-white/55">{user.email}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8b08f]">
                    <ShieldCheck size={12} strokeWidth={1.8} />
                    {formatRole(user.role)}
                  </span>

                  <StatusPill active={user.isActive} />
                </div>
              </div>
            </div>

            {/* Completion */}

            <div className="border-b border-[#f0ebe6] px-6 py-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#4a443f]">Profile completion</span>
                <span className="font-serif text-base text-[#b76b43]">{completion.percent}%</span>
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#f3eee9]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d98a61] to-[#b76b43] transition-all duration-500"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>

              <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                {completion.checks.map((item) => (
                  <li
                    key={item.label}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      item.done ? 'text-[#4a443f]' : 'text-[#aaa29b]'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                    ) : (
                      <Circle size={13} className="shrink-0 text-[#d6cec7]" />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta */}

            <dl className="space-y-3.5 px-6 py-5">
              <MetaRow icon={CalendarDays} label="Member since" value={formatDate(user.createdAt)} />
              <MetaRow icon={Clock3} label="Last login" value={formatDateTime(user.lastLoginAt)} />
              <MetaRow icon={History} label="Last updated" value={formatDateTime(user.updatedAt)} />
            </dl>
          </section>

          {/* Navigation */}

          <nav
            aria-label="Account"
            className="rounded-[26px] border border-[#ece7e2] bg-white p-2.5 shadow-[0_12px_40px_rgba(27,25,23,0.04)]"
          >
            <NavItem href="/account" icon={LayoutDashboard} label="Overview" />
            <NavItem href="/account/profile" icon={User} label="Profile" active />
            <NavItem href="/account/bookings" icon={Luggage} label="My bookings" />
            <NavItem href="/account/enquiries" icon={MessageSquareText} label="Enquiries" />
            <NavItem href="/account/wishlist" icon={Heart} label="Saved journeys" />
            {isOrganizer && <NavItem href="/account/events" icon={CalendarRange} label="My events" />}
            <NavItem href="/account/password" icon={KeyRound} label="Password & security" />

            <div className="mx-3 my-2 border-t border-[#f0ebe6]" />

            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-[#c0392b] transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut size={16} strokeWidth={1.7} />
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </nav>
        </aside>

        {/* ===============================================
            MAIN
        =============================================== */}

        <div className="space-y-6">
          {/* Personal information */}

          <section className="overflow-hidden rounded-[26px] border border-[#ece7e2] bg-white shadow-[0_12px_40px_rgba(27,25,23,0.04)]">
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

                <Field
                  label="Phone / WhatsApp"
                  icon={Phone}
                  htmlFor="profile-phone"
                  hint="We'll use this for trip updates on WhatsApp."
                >
                  <input
                    id="profile-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    title={PHONE_ERROR}
                    value={form.phone}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        phone: phoneDigits(event.target.value),
                      }))
                    }
                    placeholder="10-digit mobile number"
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
                  {isDirty ? (
                    <span className="inline-flex items-center gap-1.5 text-[#a35b36]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b76b43]" />
                      You have unsaved changes
                    </span>
                  ) : (
                    <>
                      Fields marked <span className="text-[#b76b43]">*</span> are required.
                    </>
                  )}
                </p>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  {isDirty && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className={`${secondaryButtonClass} w-full sm:w-auto`}
                    >
                      <RotateCcw size={14} />
                      Discard
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={saving || !isDirty}
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
              </div>
            </form>
          </section>

          {/* Quick links */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickLink
              href="/account/password"
              icon={KeyRound}
              title="Password & security"
              description="Change the password you use to sign in."
            />

            <QuickLink
              href="/account/bookings"
              icon={Luggage}
              title="My bookings"
              description="View trip details, dates and booking status."
            />
          </section>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   LAYOUT
========================================================= */

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 pb-20 pt-28 text-[#1b1917] sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

function CardHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[#f0ebe6] px-5 py-5 sm:px-8 sm:py-6">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
        <Icon size={18} strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <h2 className="font-serif text-2xl font-medium text-[#1b1917]">{title}</h2>

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
    <div className="relative mx-auto h-24 w-24">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full rounded-full object-cover ring-4 ring-white/10"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#d98a61] to-[#9d5735] font-serif text-3xl text-white ring-4 ring-white/10">
          {getInitials(user.name)}
        </div>
      )}

      <span
        title={user.isActive ? 'Active account' : 'Inactive account'}
        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#1b1917] ${
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
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          : 'border-red-400/30 bg-red-400/10 text-red-300'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#faf6f2] text-[#b76b43]">
        <Icon size={15} strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a928b]">{label}</dt>
        <dd className="mt-0.5 truncate text-[13px] font-medium text-[#3f3a36]">{value}</dd>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: IconType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors ${
        active
          ? 'bg-[#faf1ea] text-[#9d5735]'
          : 'text-[#4a443f] hover:bg-[#faf8f6] hover:text-[#9d5735]'
      }`}
    >
      <Icon size={16} strokeWidth={1.7} className={active ? 'text-[#b76b43]' : 'text-[#a59d96]'} />
      <span className="flex-1">{label}</span>
      <ChevronRight
        size={14}
        className={`transition-transform group-hover:translate-x-0.5 ${
          active ? 'text-[#b76b43]' : 'text-[#d0c8c1]'
        }`}
      />
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[22px] border border-[#ece7e2] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#b76b43]/30 hover:shadow-[0_16px_38px_rgba(27,25,23,0.07)]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
        <Icon size={18} strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-serif text-lg text-[#1b1917]">{title}</span>
        <span className="mt-1 block text-[13px] leading-5 text-[#746d67]">{description}</span>
      </span>

      <ArrowUpRight
        size={17}
        className="mt-1 shrink-0 text-[#b76b43] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
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
      <div className="h-10 w-64 max-w-full rounded-xl bg-[#efe9e3]" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[26px] border border-[#ece7e2] bg-white">
            <div className="flex flex-col items-center bg-[#2a2622] px-6 pb-7 pt-8">
              <div className="h-24 w-24 rounded-full bg-white/10" />
              <div className="mt-4 h-5 w-36 rounded-lg bg-white/10" />
              <div className="mt-2 h-3 w-44 rounded-full bg-white/10" />
            </div>
            <div className="space-y-3 px-6 py-6">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-9 rounded-xl bg-[#faf6f2]" />
              ))}
            </div>
          </div>
          <div className="h-[300px] rounded-[26px] border border-[#ece7e2] bg-white" />
        </div>

        <div className="space-y-6">
          <div className="h-[440px] rounded-[26px] border border-[#ece7e2] bg-white" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-[104px] rounded-[22px] border border-[#ece7e2] bg-white" />
            <div className="h-[104px] rounded-[22px] border border-[#ece7e2] bg-white" />
          </div>
        </div>
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
