'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarCheck, Eye, EyeOff, LayoutGrid, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { api, setAdminSession } from '../../../lib/admin-api';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85';

const features = [
  { icon: CalendarCheck, title: 'Manage Bookings', text: 'Track every confirmed and upcoming journey.' },
  { icon: Users, title: 'Enquiries & Leads', text: 'Follow up on trip requests from travellers.' },
  { icon: LayoutGrid, title: 'Content & Journeys', text: 'Update destinations, tours and stories.' },
];

const FIELD =
  'w-full rounded-xl border border-[#ebe3da] bg-[#fdfbf9] py-3.5 pl-12 pr-4 text-sm text-[#1b1917] outline-none transition placeholder:text-[#a59c94] focus:border-[#b76b43] focus:bg-white focus:ring-4 focus:ring-[#b76b43]/10';

function Stamp() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="pointer-events-none absolute right-6 top-6 hidden h-28 w-28 rotate-[-8deg] text-[#b76b43]/25 sm:block lg:right-10 lg:top-10">
      <defs>
        <path id="admin-stamp-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <text fill="currentColor" fontSize="9" letterSpacing="3" fontWeight="600">
        <textPath href="#admin-stamp-ring">RAJASTHAN · UME HOLIDAYS · ADMIN ·</textPath>
      </text>
      <path
        d="M42 72h36M46 72V58l14-10 14 10v14M56 72v-8h8v8M60 48v-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r: any = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (r.data?.user?.role !== 'admin') throw new Error('This account does not have admin access');
      setAdminSession(r.data.token, r.data.user);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#fbf7f2] text-[#1b1917] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <Image src={HERO_IMAGE} alt="" fill priority sizes="50vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1917]/80 via-[#1b1917]/50 to-[#1b1917]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1917]/50 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-center px-12 py-16 xl:px-20">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">UME Holidays · Admin</span>
            <span className="h-px w-24 bg-white/50" />
          </div>

          <h1 className="mt-8 font-serif text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-white xl:text-6xl">
            Your travel desk
            <br />
            <span className="text-[#e0a47f]">awaits.</span>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/80">
            Sign in to manage bookings, follow up on enquiries and keep every Rajasthan journey running smoothly.
          </p>

          <ul className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/90 text-[#b76b43] shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  <Icon size={19} strokeWidth={1.6} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{title}</span>
                  <span className="mt-0.5 block text-xs text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#b76b43]/[0.06] blur-[90px]" />
        <Stamp />

        <Link href="/" className="relative mb-8 lg:hidden">
          <Image src="/images/logo.png" alt="UME Holidays" width={120} height={94} priority />
        </Link>

        <form
          onSubmit={submit}
          className="relative w-full max-w-[460px] rounded-[28px] border border-[#eee6dd] bg-white px-6 py-10 shadow-[0_24px_70px_rgba(27,25,23,0.08)] sm:px-10"
        >
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6f665f]">Welcome to</p>
          <h2 className="mt-3 text-center font-serif text-4xl font-medium tracking-[-0.01em] text-[#1b1917]">UME Holidays</h2>

          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-14 bg-[#b76b43]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#b76b43]" />
            <span className="h-px w-14 bg-[#b76b43]/50" />
          </div>

          <p className="mt-5 text-center text-sm text-[#7a716a]">Sign in to the admin panel to manage your travel operations.</p>

          {error ? (
            <div role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <label className="mt-8 block">
            <span className="sr-only">Email address</span>
            <span className="relative block">
              <Mail size={17} strokeWidth={1.7} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8f857d]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                className={FIELD}
              />
            </span>
          </label>

          <label className="mt-4 block">
            <span className="sr-only">Password</span>
            <span className="relative block">
              <Lock size={17} strokeWidth={1.7} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8f857d]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Password"
                className={`${FIELD} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#8f857d] transition hover:bg-[#f6efe8] hover:text-[#b76b43]"
              >
                {showPassword ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
              </button>
            </span>
          </label>

          <div className="mt-4 flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-[#b76b43] transition hover:text-[#934f30]">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b76b43] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(183,107,67,0.25)] transition hover:bg-[#934f30] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading ? <ArrowRight size={16} /> : null}
          </button>

          <div className="mt-8 flex items-center gap-4 text-[11px] text-[#9a9089]">
            <span className="h-px flex-1 bg-[#eee6dd]" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#b76b43]" /> Restricted to admin accounts
            </span>
            <span className="h-px flex-1 bg-[#eee6dd]" />
          </div>

          <p className="mt-6 text-center text-xs text-[#7a716a]">
            <Link href="/" className="inline-flex items-center gap-1.5 font-medium text-[#b76b43] underline-offset-4 transition hover:text-[#934f30] hover:underline">
              <ArrowLeft size={13} /> Back to website
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
