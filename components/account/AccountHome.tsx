'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Crown,
  Headphones,
  Heart,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  Luggage,
  Mail,
  Map as MapIcon,
  MapPin,
  Plane,
  UserRound,
  Users,
} from 'lucide-react';

import { apiFetch } from '../../lib/api';

/* =========================================================
   TYPES
========================================================= */

type AccountUser = {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

type Booking = {
  _id: string;
  status?: string;
  travelDate?: string;
  travellers?: number;
  tourSnapshot?: {
    slug?: string;
    title?: string;
    duration?: string;
    image?: string;
  };
};

type Enquiry = {
  _id: string;
  status?: string;
};

type IconType = typeof CalendarDays;

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
};

/* =========================================================
   CONSTANTS
========================================================= */

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=1400&q=80';

const HELP_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80';

const CLOSED_ENQUIRY_STATUSES = new Set(['converted', 'closed']);
const UPCOMING_BOOKING_STATUSES = new Set(['pending', 'confirmed']);

const baseNav: NavItem[] = [
  { label: 'Overview', href: '/account', icon: LayoutGrid },
  { label: 'My Bookings', href: '/account/bookings', icon: CalendarDays },
  { label: 'Enquiries', href: '/account/enquiries', icon: Mail },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Profile Settings', href: '/account/profile', icon: UserRound },
  { label: 'Change Password', href: '/account/password', icon: LockKeyhole },
];

const quickActions = [
  {
    label: 'Plan a Trip',
    description: 'Explore destinations and create your next journey',
    href: '/plan-your-trip',
    icon: MapIcon,
  },
  {
    label: 'View Wishlist',
    description: 'See your saved places and experiences',
    href: '/account/wishlist',
    icon: Heart,
  },
  {
    label: 'Send an Enquiry',
    description: 'Get in touch with our travel experts',
    href: '/contact',
    icon: Mail,
  },
  {
    label: 'Update Profile',
    description: 'Manage your personal details',
    href: '/account/profile',
    icon: UserRound,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name?: string) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function formatDate(value?: string) {
  if (!value) return 'Date to confirm';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to confirm';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function isUpcoming(booking: Booking, todayStart: number) {
  if (!UPCOMING_BOOKING_STATUSES.has(booking.status || 'pending')) return false;
  if (!booking.travelDate) return true;

  const time = new Date(booking.travelDate).getTime();
  return Number.isNaN(time) || time >= todayStart;
}

function readStoredUser(): AccountUser | null {
  const raw = localStorage.getItem('ume_user');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AccountUser;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    localStorage.removeItem('ume_user');
    return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function AccountHome() {
  const router = useRouter();

  const [user, setUser] = useState<AccountUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setUser(readStoredUser());

    Promise.allSettled([
      apiFetch<Booking[]>('/bookings/me'),
      apiFetch<Enquiry[]>('/enquiries/me'),
      apiFetch<unknown[]>('/wishlist'),
    ]).then(([bookingResult, enquiryResult, wishlistResult]) => {
      if (cancelled) return;

      if (bookingResult.status === 'fulfilled' && Array.isArray(bookingResult.value.data)) {
        setBookings(bookingResult.value.data);
      }

      if (enquiryResult.status === 'fulfilled' && Array.isArray(enquiryResult.value.data)) {
        setEnquiries(enquiryResult.value.data);
      }

      if (wishlistResult.status === 'fulfilled' && Array.isArray(wishlistResult.value.data)) {
        setWishlistCount(wishlistResult.value.data.length);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    return bookings
      .filter((booking) => isUpcoming(booking, todayStart))
      .sort((a, b) => {
        const aTime = a.travelDate ? new Date(a.travelDate).getTime() : Infinity;
        const bTime = b.travelDate ? new Date(b.travelDate).getTime() : Infinity;
        return aTime - bTime;
      });
  }, [bookings]);

  const activeEnquiries = useMemo(
    () => enquiries.filter((item) => !CLOSED_ENQUIRY_STATUSES.has(item.status || 'new')).length,
    [enquiries],
  );

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

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'traveller';
  const nextJourney = upcomingBookings[0];

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 pb-16 pt-28 text-[#1b1917] sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AccountSidebar user={user} onLogout={logout} loggingOut={loggingOut} />

        <div className="min-w-0 space-y-5">
          {/* =============================================
              WELCOME HERO
          ============================================= */}

          <section className="relative overflow-hidden rounded-[24px] border border-[#ece7e2] bg-white shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-y-0 right-0 h-full w-full object-cover object-center xl:w-[62%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50 xl:hidden" />
            <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,#fff_0%,#fff_38%,rgba(255,255,255,0.75)_46%,rgba(255,255,255,0)_64%)] xl:block" />

            <HeroFlightPath />

            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a35b36]">
                Your UME
              </p>
              <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#1b1917] sm:text-5xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#746d67]">
                Everything for your next journey, all in one place.
              </p>
            </div>
          </section>

          {/* =============================================
              STATS
          ============================================= */}

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Luggage}
              value={upcomingBookings.length}
              label="Upcoming Trips"
              description="Your confirmed journeys"
              href="/account/bookings"
              loading={loading}
            />
            <StatCard
              icon={Heart}
              value={wishlistCount}
              label="Saved Journeys"
              description="Places in your wishlist"
              href="/account/wishlist"
              loading={loading}
            />
            <StatCard
              icon={Mail}
              value={activeEnquiries}
              label="Active Enquiries"
              description="Track your requests"
              href="/account/enquiries"
              loading={loading}
            />
          </section>

          {/* =============================================
              UPCOMING + QUICK ACTIONS
          ============================================= */}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <section className="flex flex-col rounded-[24px] border border-[#ece7e2] bg-white p-6 shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-2xl text-[#1b1917]">Upcoming Journey</h2>
                <Link
                  href="/account/bookings"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#a35b36] transition-colors hover:text-[#7f4427]"
                >
                  View All
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {loading ? (
                <div className="mt-6 flex-1 animate-pulse rounded-2xl bg-[#faf6f2]" style={{ minHeight: 220 }} />
              ) : nextJourney ? (
                <UpcomingJourney booking={nextJourney} />
              ) : (
                <EmptyJourney />
              )}
            </section>

            <section className="rounded-[24px] border border-[#ece7e2] bg-white p-6 shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
              <h2 className="font-serif text-2xl text-[#1b1917]">Quick Actions</h2>

              <div className="mt-5 space-y-3">
                {quickActions.map(({ label, description, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group flex items-center gap-4 rounded-2xl border border-[#efeae5] px-4 py-3 transition-all hover:border-[#b76b43]/30 hover:bg-[#fdfaf7]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
                      <Icon size={17} strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#1b1917]">{label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[#8a837c]">{description}</span>
                    </span>
                    <ChevronRight
                      size={17}
                      className="shrink-0 text-[#6f6862] transition-transform group-hover:translate-x-0.5 group-hover:text-[#b76b43]"
                    />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* =============================================
              HELP BANNER
          ============================================= */}

          <section className="relative overflow-hidden rounded-[24px] border border-[#ece7e2] bg-white shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
            <img
              src={HELP_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-y-0 right-0 hidden h-full w-[34%] object-cover object-[70%_15%] md:block"
            />
            <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0)_45%)] md:block" />
            <Plane
              size={22}
              strokeWidth={1.5}
              aria-hidden
              className="absolute right-[36%] top-6 hidden rotate-12 text-[#8a6a55] md:block"
            />

            <div className="relative flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:px-8 md:pr-[38%]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
                <Headphones size={20} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl text-[#1b1917] sm:text-2xl">Need help with your booking?</h2>
                <p className="mt-1 text-sm text-[#8a837c]">Our travel experts are here to assist you.</p>
              </div>
              <Link href="/contact" className={`${primaryButtonClass} w-fit`}>
                Contact Us
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function AccountSidebar({
  user,
  onLogout,
  loggingOut,
}: {
  user: AccountUser | null;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const pathname = usePathname();

  const nav = [...baseNav];
  if (user?.role === 'organizer') {
    nav.splice(4, 0, { label: 'My Events', href: '/account/events', icon: CalendarRange });
  }

  const badge = user?.role === 'organizer' ? 'UME Organizer' : 'UME Traveller';

  return (
    <aside className="h-fit rounded-[24px] border border-[#ece7e2] bg-white p-5 shadow-[0_8px_30px_rgba(27,25,23,0.04)] lg:sticky lg:top-28">
      <div className="flex flex-col items-center text-center">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'Profile'}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#f7e9de] font-serif text-3xl text-[#9d5735]">
            {getInitials(user?.name)}
          </div>
        )}

        <p className="mt-4 max-w-full truncate font-serif text-lg font-semibold text-[#1b1917]">
          {user?.name || 'Traveller'}
        </p>
        {user?.email && (
          <p className="mt-0.5 max-w-full truncate text-xs text-[#8a837c]">{user.email}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#faf1ea] px-3 py-1 text-[11px] font-semibold text-[#9d5735]">
          <Crown size={12} strokeWidth={2} />
          {badge}
        </span>
      </div>

      <nav aria-label="Account" className="mt-6 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                active
                  ? 'bg-[#f7ebe2] font-semibold text-[#9d5735]'
                  : 'text-[#3f3a36] hover:bg-[#faf6f2] hover:text-[#9d5735]'
              }`}
            >
              {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#b76b43]" />}
              <Icon size={17} strokeWidth={1.7} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-[#f0ebe6] pt-5">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#c0392b] transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut size={17} strokeWidth={1.7} />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  value,
  label,
  description,
  href,
  loading,
}: {
  icon: IconType;
  value: number;
  label: string;
  description: string;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[20px] border border-[#ece7e2] bg-white p-5 shadow-[0_8px_30px_rgba(27,25,23,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#b76b43]/30 hover:shadow-[0_14px_36px_rgba(27,25,23,0.07)]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-serif text-2xl leading-7 ${
            loading ? 'animate-pulse text-[#d9cfc7]' : 'text-[#1b1917]'
          }`}
        >
          {loading ? '–' : value}
        </span>
        <span className="mt-1 block text-sm font-medium text-[#1b1917]">{label}</span>
        <span className="mt-0.5 block text-xs text-[#8a837c]">{description}</span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#ece7e2] text-[#6f6862] transition group-hover:border-[#b76b43] group-hover:bg-[#b76b43] group-hover:text-white">
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

/* =========================================================
   UPCOMING JOURNEY
========================================================= */

function UpcomingJourney({ booking }: { booking: Booking }) {
  const title = booking.tourSnapshot?.title || 'Tour booking';
  const travellers = booking.travellers || 0;

  return (
    <Link
      href={`/account/bookings/${booking._id}`}
      className="group mt-6 flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#efeae5] transition hover:border-[#b76b43]/30 sm:flex-row"
    >
      <div className="relative h-48 shrink-0 overflow-hidden bg-[#faf6f2] sm:h-auto sm:w-[42%]">
        {booking.tourSnapshot?.image ? (
          <img
            src={booking.tourSnapshot.image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full min-h-48 place-items-center text-[#b76b43]">
            <MapPin size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-5">
        <span className="w-fit rounded-full border border-[#eadfd6] bg-[#fff9f5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a35b36]">
          {booking.status || 'pending'}
        </span>
        <h3 className="mt-3 font-serif text-2xl leading-tight text-[#1b1917] transition-colors group-hover:text-[#a35b36]">
          {title}
        </h3>
        {booking.tourSnapshot?.duration && (
          <p className="mt-1 text-xs text-[#8a837c]">{booking.tourSnapshot.duration}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#4b4540]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={15} strokeWidth={1.7} className="text-[#b76b43]" />
            {formatDate(booking.travelDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users size={15} strokeWidth={1.7} className="text-[#b76b43]" />
            {travellers} {travellers === 1 ? 'traveller' : 'travellers'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyJourney() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
      <div className="relative h-32 w-64">
        <svg viewBox="0 0 256 128" className="absolute inset-0 h-full w-full" aria-hidden>
          <path
            d="M18 104c6-16 22-20 32-14 6-14 24-18 34-6 10-6 24 0 26 12h-92z"
            fill="#f7ebe2"
          />
          <path
            d="M150 104c4-14 18-20 30-14 6-16 28-20 38-6 12-4 24 4 24 20h-92z"
            fill="#f7ebe2"
          />
          <path d="M10 112h236" stroke="#efe2d8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-3 left-1/2 grid h-24 w-20 -translate-x-1/2 place-items-center rounded-2xl text-[#c98a63]">
          <Luggage size={72} strokeWidth={1.2} />
        </span>
      </div>

      <h3 className="mt-4 font-serif text-2xl text-[#1b1917]">No upcoming Journeys yet</h3>
      <p className="mt-2 max-w-sm text-sm text-[#8a837c]">
        Start exploring destinations and plan your next unforgettable trip.
      </p>
      <Link href="/tours" className={`${primaryButtonClass} mt-5`}>
        Explore Journeys
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

/* =========================================================
   DECORATION
========================================================= */

function HeroFlightPath() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[44%] hidden w-[24%] xl:block">
      <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path
          d="M10 100 C 50 110, 80 60, 120 70 S 170 40, 190 22"
          fill="none"
          stroke="#c9a58d"
          strokeWidth="1.2"
          strokeDasharray="4 5"
        />
      </svg>
      <Plane size={22} strokeWidth={1.5} className="absolute right-0 top-[10%] rotate-12 text-[#8a6a55]" />
      <MapPin size={20} strokeWidth={1.5} className="absolute bottom-[10%] left-[22%] text-[#c98a63]" />
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b76b43] px-6 text-sm font-medium text-white shadow-[0_10px_26px_rgba(183,107,67,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9d5735]';
