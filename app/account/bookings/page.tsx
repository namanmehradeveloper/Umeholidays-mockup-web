
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiFetch } from '../../../lib/api';

/* =========================================================
   TYPES
========================================================= */

type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | string;

type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'refunded'
  | 'failed'
  | string;

type TourSnapshot = {
  slug?: string;
  title?: string;
  duration?: string;
  image?: string;
};

type BookingContact = {
  name?: string;
  email?: string;
  phone?: string;
};

type Booking = {
  _id: string;
  id?: string;

  user?: string;
  tour?: string;

  tourSnapshot?: TourSnapshot;

  contact?: BookingContact;

  travelDate?: string;

  travellers?: number;

  pricePerPerson?: number;
  totalAmount?: number;

  currency?: string;

  status?: BookingStatus;
  paymentStatus?: PaymentStatus;

  specialRequests?: string;

  createdAt?: string;
  updatedAt?: string;

  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
};

type BookingResponse = {
  success: boolean;
  data: Booking[];
};

type FilterValue =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string) {
  if (!value) return 'Not available';

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
  if (!value) return 'Not available';

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

function formatCurrency(
  amount?: number,
  currency = 'INR'
) {
  if (
    amount === undefined ||
    amount === null ||
    Number.isNaN(Number(amount))
  ) {
    return '—';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }
}

function statusClasses(status?: string) {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'border-blue-200 bg-blue-50 text-blue-700';

    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'pending':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function paymentClasses(status?: string) {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'refunded':
      return 'border-blue-200 bg-blue-50 text-blue-700';

    case 'failed':
      return 'border-red-200 bg-red-50 text-red-700';

    default:
      return 'border-[#e8e1da] bg-[#faf8f5] text-[#776f68]';
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  const [items, setItems] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [filter, setFilter] =
    useState<FilterValue>('all');

  const [query, setQuery] = useState('');

  /* =======================================================
     LOAD BOOKINGS
  ======================================================= */

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const result =
          await apiFetch<BookingResponse>(
            '/bookings/me'
          );

        setItems(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load bookings';

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const active = items.filter(
      (booking) =>
        booking.status === 'pending' ||
        booking.status === 'confirmed'
    );

    const cancelled = items.filter(
      (booking) =>
        booking.status === 'cancelled'
    );

    const completed = items.filter(
      (booking) =>
        booking.status === 'completed'
    );

    const activeValue = items
      .filter(
        (booking) =>
          booking.status !== 'cancelled'
      )
      .reduce(
        (sum, booking) =>
          sum +
          Number(booking.totalAmount || 0),
        0
      );

    return {
      total: items.length,
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
      activeValue,
    };
  }, [items]);

  /* =======================================================
     FILTERED BOOKINGS
  ======================================================= */

  const filteredItems = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return items.filter((booking) => {
      if (
        filter !== 'all' &&
        booking.status !== filter
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const values = [
        booking.tourSnapshot?.title,
        booking.tourSnapshot?.duration,
        booking.contact?.name,
        booking.contact?.email,
        booking.contact?.phone,
        booking.status,
        booking.paymentStatus,
        booking._id,
      ];

      return values.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [items, filter, query]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#fafafa]

        px-4
        pb-20
        pt-28

        sm:px-6
        sm:pt-32

        lg:px-8
        lg:pt-36
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b76b43]" />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#a35b36]
                "
              >
                Your UME
              </p>
            </div>

            <h1
              className="
                mt-3
                font-serif
                text-4xl
                font-medium
                tracking-[-0.035em]
                text-[#1b1917]

                sm:text-5xl
              "
            >
              My bookings
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-[#746d67]
              "
            >
              View your upcoming journeys,
              completed trips, booking details and
              payment status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="
              inline-flex
              min-h-11
              w-fit
              items-center
              justify-center
              gap-2

              rounded-xl

              border
              border-[#e6dfd9]

              bg-white

              px-4

              text-[10px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-[#5f5751]

              shadow-sm

              transition-all
              duration-200

              hover:border-[#b76b43]/40
              hover:text-[#a35b36]

              disabled:opacity-50
            "
          >
            <RefreshCw
              size={14}
              strokeWidth={1.8}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mt-7
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div
            className="
              mt-8
              flex
              min-h-[400px]
              items-center
              justify-center

              rounded-[28px]

              border
              border-[#ece7e2]

              bg-white
            "
          >
            <div className="text-center">
              <Loader2
                size={28}
                strokeWidth={1.7}
                className="
                  mx-auto
                  animate-spin
                  text-[#b76b43]
                "
              />

              <p
                className="
                  mt-4
                  text-sm
                  text-[#776f69]
                "
              >
                Loading your bookings…
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =============================================
                STATS
            ============================================= */}

            <div
              className="
                mt-8

                grid
                grid-cols-2
                gap-3

                lg:grid-cols-4
              "
            >
              <StatCard
                icon={CalendarDays}
                label="Total bookings"
                value={String(stats.total)}
              />

              <StatCard
                icon={Clock3}
                label="Upcoming"
                value={String(stats.active)}
              />

              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={String(stats.completed)}
              />

              <StatCard
                icon={IndianRupee}
                label="Booking value"
                value={formatCurrency(
                  stats.activeValue
                )}
              />
            </div>

            {/* =============================================
                FILTER / SEARCH
            ============================================= */}

            <section
              className="
                mt-6
                rounded-[24px]
                border
                border-[#e9e4df]
                bg-white
                p-3
                shadow-[0_8px_30px_rgba(27,25,23,0.035)]
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3

                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                {/* Search */}

                <div
                  className="
                    relative
                    min-w-0
                    flex-1

                    lg:max-w-md
                  "
                >
                  <Search
                    size={15}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#aaa29b]
                    "
                  />

                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search bookings..."
                    className="
                      min-h-11
                      w-full
                      rounded-xl
                      border
                      border-[#ebe5df]
                      bg-[#fcfbfa]
                      pl-10
                      pr-4
                      text-sm
                      text-[#1b1917]
                      outline-none
                      transition
                      placeholder:text-[#aaa29b]

                      focus:border-[#b76b43]
                      focus:bg-white
                    "
                  />
                </div>

                {/* Filters */}

                <div
                  className="
                    flex
                    gap-2
                    overflow-x-auto
                    pb-1
                    lg:pb-0
                  "
                >
                  {(
                    [
                      'all',
                      'pending',
                      'confirmed',
                      'completed',
                      'cancelled',
                    ] as FilterValue[]
                  ).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(value)
                      }
                      className={`
                        min-h-10
                        shrink-0

                        rounded-xl

                        px-4

                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.1em]

                        transition-all
                        duration-200

                        ${
                          filter === value
                            ? 'bg-[#b76b43] text-white shadow-[0_6px_18px_rgba(183,107,67,0.2)]'
                            : 'border border-[#ebe5df] bg-white text-[#766e67] hover:border-[#b76b43]/40 hover:text-[#a35b36]'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* =============================================
                BOOKINGS
            ============================================= */}

            <div className="mt-6 space-y-5">
              {filteredItems.map(
                (booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                  />
                )
              )}

              {/* Empty filtered */}

              {items.length > 0 &&
                filteredItems.length === 0 && (
                  <div
                    className="
                      rounded-[28px]
                      border
                      border-dashed
                      border-[#dcd5ce]

                      bg-white

                      px-6
                      py-16

                      text-center
                    "
                  >
                    <Search
                      size={24}
                      strokeWidth={1.6}
                      className="
                        mx-auto
                        text-[#b76b43]
                      "
                    />

                    <h3
                      className="
                        mt-4
                        font-serif
                        text-2xl
                        text-[#1b1917]
                      "
                    >
                      No matching bookings
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-[#827a73]
                      "
                    >
                      Try another search or
                      booking-status filter.
                    </p>
                  </div>
                )}

              {/* No bookings */}

              {!items.length && (
                <div
                  className="
                    rounded-[28px]
                    border
                    border-[#e9e4df]

                    bg-white

                    px-6
                    py-16

                    text-center

                    shadow-[0_10px_35px_rgba(27,25,23,0.035)]
                  "
                >
                  <div
                    className="
                      mx-auto
                      grid
                      h-14
                      w-14
                      place-items-center
                      rounded-full
                      bg-[#faf5f1]
                      text-[#b76b43]
                    "
                  >
                    <MapPin
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h2
                    className="
                      mt-5
                      font-serif
                      text-2xl
                      text-[#1b1917]
                    "
                  >
                    No bookings yet
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-md
                      text-sm
                      leading-6
                      text-[#777069]
                    "
                  >
                    Your future journeys will
                    appear here after you make a
                    booking.
                  </p>

                  <Link
                    href="/tours"
                    className="
                      mt-6
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#b76b43]
                      px-5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-white
                    "
                  >
                    Explore tours

                    <ArrowRight
                      size={14}
                    />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
}: {
  booking: Booking;
}) {
  const title =
    booking.tourSnapshot?.title ||
    'Tour booking';

  const currency =
    booking.currency || 'INR';

  const isCancelled =
    booking.status === 'cancelled';

  return (
    <article
      className="
        overflow-hidden

        rounded-[28px]

        border
        border-[#e9e4df]

        bg-white

        shadow-[0_10px_35px_rgba(27,25,23,0.04)]

        transition-all
        duration-300

        hover:-translate-y-0.5
        hover:border-[#b76b43]/25
        hover:shadow-[0_16px_45px_rgba(27,25,23,0.07)]
      "
    >
      <div
        className="
          grid
          grid-cols-1

          md:grid-cols-[230px_minmax(0,1fr)]
        "
      >
        {/* ===============================================
            IMAGE
        =============================================== */}

        <Link
          href={`/account/bookings/${booking._id}`}
          className="
            relative
            block
            min-h-[220px]
            overflow-hidden
            bg-[#f3eee9]

            md:min-h-full
          "
        >
          {booking.tourSnapshot?.image ? (
            <Image
              src={booking.tourSnapshot.image}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 767px) 100vw, 230px"
              className="
                object-cover
                transition-transform
                duration-700
                hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                min-h-[220px]
                items-center
                justify-center
                bg-[#faf6f2]
                text-[#b76b43]
              "
            >
              <MapPin
                size={28}
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Date badge */}

          <div
            className="
              absolute
              left-4
              top-4

              rounded-xl

              border
              border-white/70

              bg-white/95

              px-3
              py-2

              shadow-lg
              backdrop-blur
            "
          >
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-[#9a928a]
              "
            >
              Travel
            </p>

            <p
              className="
                mt-0.5
                text-xs
                font-semibold
                text-[#342f2b]
              "
            >
              {formatDate(
                booking.travelDate
              )}
            </p>
          </div>
        </Link>

        {/* ===============================================
            CONTENT
        =============================================== */}

        <div className="min-w-0 p-5 sm:p-6">
          {/* Top */}

          <div
            className="
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#a35b36]
                "
              >
                Booking
              </p>

              <Link
                href={`/account/bookings/${booking._id}`}
              >
                <h2
                  className="
                    mt-1
                    font-serif
                    text-2xl
                    font-medium
                    leading-tight
                    text-[#1b1917]

                    transition-colors

                    hover:text-[#a35b36]

                    sm:text-3xl
                  "
                >
                  {title}
                </h2>
              </Link>

              {booking.tourSnapshot
                ?.duration && (
                <p
                  className="
                    mt-1.5
                    text-xs
                    text-[#827a73]
                  "
                >
                  {
                    booking
                      .tourSnapshot
                      .duration
                  }
                </p>
              )}
            </div>

            {/* Status */}

            <div
              className="
                flex
                shrink-0
                flex-wrap
                gap-2
              "
            >
              <span
                className={`
                  inline-flex
                  items-center
                  rounded-full
                  border
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.1em]

                  ${statusClasses(
                    booking.status
                  )}
                `}
              >
                {booking.status ||
                  'pending'}
              </span>

              <span
                className={`
                  inline-flex
                  items-center
                  rounded-full
                  border
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.1em]

                  ${paymentClasses(
                    booking.paymentStatus
                  )}
                `}
              >
                {booking.paymentStatus ||
                  'unpaid'}
              </span>
            </div>
          </div>

          {/* Details */}

          <div
            className="
              mt-6

              grid
              grid-cols-2
              gap-4

              lg:grid-cols-4
            "
          >
            <MiniInfo
              icon={CalendarDays}
              label="Travel date"
              value={formatDate(
                booking.travelDate
              )}
            />

            <MiniInfo
              icon={Users}
              label="Travellers"
              value={`${booking.travellers || 0} ${
                booking.travellers === 1
                  ? 'person'
                  : 'people'
              }`}
            />

            <MiniInfo
              icon={IndianRupee}
              label="Per person"
              value={formatCurrency(
                booking.pricePerPerson,
                currency
              )}
            />

            <MiniInfo
              icon={CreditCard}
              label="Total"
              value={formatCurrency(
                booking.totalAmount,
                currency
              )}
              strong
            />
          </div>

          {/* Contact */}

          {(booking.contact?.name ||
            booking.contact?.email ||
            booking.contact?.phone) && (
            <div
              className="
                mt-6

                grid
                gap-3

                rounded-2xl

                border
                border-[#eee8e2]

                bg-[#fdfcfa]

                p-4

                sm:grid-cols-3
              "
            >
              {booking.contact?.name && (
                <ContactItem
                  icon={Users}
                  label="Traveller"
                  value={
                    booking.contact.name
                  }
                />
              )}

              {booking.contact?.email && (
                <ContactItem
                  icon={Mail}
                  label="Email"
                  value={
                    booking.contact.email
                  }
                />
              )}

              {booking.contact?.phone && (
                <ContactItem
                  icon={Phone}
                  label="Phone"
                  value={
                    booking.contact.phone
                  }
                />
              )}
            </div>
          )}

          {/* Special request */}

          {booking.specialRequests && (
            <div
              className="
                mt-4
                rounded-xl
                bg-[#faf7f4]
                px-4
                py-3
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#9b938c]
                "
              >
                Special request
              </p>

              <p
                className="
                  mt-1
                  line-clamp-2
                  text-xs
                  leading-5
                  text-[#665f59]
                "
              >
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Cancelled */}

          {isCancelled && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-100
                bg-red-50/70
                px-4
                py-3
              "
            >
              <div className="flex gap-3">
                <XCircle
                  size={17}
                  strokeWidth={1.7}
                  className="
                    mt-0.5
                    shrink-0
                    text-red-500
                  "
                />

                <div>
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-red-600
                    "
                  >
                    Booking cancelled
                  </p>

                  {booking.cancellationReason && (
                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-red-700
                      "
                    >
                      {
                        booking.cancellationReason
                      }
                    </p>
                  )}

                  {booking.cancelledAt && (
                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-red-500
                      "
                    >
                      {formatDateTime(
                        booking.cancelledAt
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}

          <div
            className="
              mt-5

              flex
              flex-col
              gap-3

              border-t
              border-[#eee9e4]

              pt-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#aaa29b]
                "
              >
                Booking ID
              </p>

              <p
                className="
                  mt-1
                  max-w-[230px]
                  truncate
                  font-mono
                  text-[10px]
                  text-[#777069]
                "
              >
                {booking.id ||
                  booking._id}
              </p>
            </div>

            <Link
              href={`/account/bookings/${booking._id}`}
              className="
                group

                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2

                rounded-xl

                border
                border-[#e5ded8]

                bg-white

                px-4

                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-[#5f5751]

                transition-all
                duration-200

                hover:border-[#b76b43]
                hover:text-[#a35b36]
              "
            >
              View details

              <ArrowRight
                size={14}
                strokeWidth={1.8}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-[20px]

        border
        border-[#e9e4df]

        bg-white

        p-4

        shadow-[0_6px_24px_rgba(27,25,23,0.03)]

        sm:p-5
      "
    >
      <div
        className="
          grid
          h-9
          w-9
          place-items-center
          rounded-xl
          bg-[#faf5f1]
          text-[#b76b43]
        "
      >
        <Icon
          size={16}
          strokeWidth={1.7}
        />
      </div>

      <p
        className="
          mt-4

          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-[#9d958e]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1

          font-serif
          text-xl
          font-medium
          text-[#1b1917]

          sm:text-2xl
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
  icon: Icon,
  label,
  value,
  strong,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div
        className="
          flex
          items-center
          gap-1.5

          text-[9px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#a09992]
        "
      >
        <Icon
          size={12}
          strokeWidth={1.7}
          className="text-[#b76b43]"
        />

        {label}
      </div>

      <p
        className={`
          mt-1.5
          truncate
          text-sm
          text-[#4b4540]

          ${
            strong
              ? 'font-semibold text-[#1b1917]'
              : 'font-medium'
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

function ContactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div
        className="
          flex
          items-center
          gap-1.5

          text-[8px]
          font-bold
          uppercase
          tracking-[0.13em]
          text-[#aaa29b]
        "
      >
        <Icon
          size={11}
          strokeWidth={1.7}
          className="text-[#b76b43]"
        />

        {label}
      </div>

      <p
        className="
          mt-1
          truncate
          text-xs
          font-medium
          text-[#554f49]
        "
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
