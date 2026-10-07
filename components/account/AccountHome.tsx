'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Heart,
  LogOut,
  Luggage,
  Mail,
  MapPin,
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

/* =========================================================
   CONSTANTS
========================================================= */

const CLOSED_ENQUIRY_STATUSES = new Set(['converted', 'closed']);
const UPCOMING_BOOKING_STATUSES = new Set(['pending', 'confirmed']);

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
  const isOrganizer = user?.role === 'organizer';

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 pb-16 pt-28 text-[#1b1917] sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* =============================================
            PROFILE
        ============================================= */}

        <section className="flex flex-col gap-5 rounded-[24px] border border-[#ece7e2] bg-white p-6 shadow-[0_8px_30px_rgba(27,25,23,0.04)] sm:flex-row sm:items-center sm:p-8">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'Profile'}
              className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f7e9de] font-serif text-2xl text-[#9d5735] sm:h-20 sm:w-20">
              {getInitials(user?.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a35b36]">
              {isOrganizer ? 'UME Organizer' : 'UME Traveller'}
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            {user?.email && <p className="mt-1 truncate text-sm text-[#8a837c]">{user.email}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            {isOrganizer && (
              <Link href="/account/events" className={secondaryButtonClass}>
                <CalendarRange size={15} strokeWidth={1.7} />
                My Events
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className={`${secondaryButtonClass} text-[#c0392b] hover:border-red-200 hover:bg-red-50 hover:text-[#c0392b] disabled:opacity-50`}
            >
              <LogOut size={15} strokeWidth={1.7} />
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </section>

        {/* =============================================
            STATS
        ============================================= */}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Luggage} value={upcomingBookings.length} label="Upcoming Trips" loading={loading} />
          <StatCard icon={Heart} value={wishlistCount} label="Saved Journeys" loading={loading} />
          <StatCard icon={Mail} value={activeEnquiries} label="Active Enquiries" loading={loading} />
        </section>

        {/* =============================================
            UPCOMING JOURNEY
        ============================================= */}

        <section className="rounded-[24px] border border-[#ece7e2] bg-white p-6 shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
          <h2 className="font-serif text-2xl">Upcoming Journey</h2>

          {loading ? (
            <div className="mt-6 animate-pulse rounded-2xl bg-[#faf6f2]" style={{ minHeight: 200 }} />
          ) : nextJourney ? (
            <UpcomingJourney booking={nextJourney} />
          ) : (
            <EmptyJourney />
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  value,
  label,
  loading,
}: {
  icon: IconType;
  value: number;
  label: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-[#ece7e2] bg-white p-5 shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#faf1ea] text-[#b76b43]">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <span className="min-w-0">
        <span
          className={`block font-serif text-2xl leading-7 ${
            loading ? 'animate-pulse text-[#d9cfc7]' : 'text-[#1b1917]'
          }`}
        >
          {loading ? '–' : value}
        </span>
        <span className="mt-1 block text-sm text-[#8a837c]">{label}</span>
      </span>
    </div>
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
      className="group mt-6 flex flex-col overflow-hidden rounded-2xl border border-[#efeae5] transition hover:border-[#b76b43]/30 sm:flex-row"
    >
      <div className="relative h-48 shrink-0 overflow-hidden bg-[#faf6f2] sm:h-auto sm:w-[40%]">
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
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#faf1ea] text-[#c98a63]">
        <Luggage size={30} strokeWidth={1.4} />
      </span>
      <h3 className="mt-4 font-serif text-2xl">No upcoming journeys yet</h3>
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
   STYLES
========================================================= */

const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b76b43] px-6 text-sm font-medium text-white shadow-[0_10px_26px_rgba(183,107,67,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9d5735]';

const secondaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ece7e2] px-4 text-sm font-medium text-[#3f3a36] transition-colors hover:border-[#b76b43]/40 hover:bg-[#faf6f2] hover:text-[#9d5735]';
