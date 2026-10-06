'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../lib/api';

export default function BookingDetails() {
  const params = useParams<{ id: string }>();

  const [booking, setBooking] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const result = await apiFetch<any>(
        `/bookings/${encodeURIComponent(params.id)}`
      );

      setBooking(result.data);
    } catch (e: any) {
      setError(e.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      load();
    }
  }, [params.id]);

  async function cancel() {
    if (!booking || !window.confirm('Cancel this booking?')) return;

    setBusy(true);
    setError('');

    try {
      const result = await apiFetch<any>(
        `/bookings/${encodeURIComponent(booking._id)}/cancel`,
        {
          method: 'PATCH',
          data: { reason },
        }
      );

      setBooking(result.data);
    } catch (e: any) {
      setError(e.message || 'Unable to cancel booking');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-5 pt-36">
        <div className="mx-auto max-w-3xl">
          Loading booking…
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen px-5 pt-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-600">
            {error || 'Booking not found'}
          </p>

          <Link
            href="/account/bookings"
            className="mt-4 inline-block underline"
          >
            Back to bookings
          </Link>
        </div>
      </main>
    );
  }

  const canCancel =
    ['pending', 'confirmed'].includes(booking.status) &&
    new Date(booking.travelDate) > new Date();

  return (
    <main className="min-h-screen px-5 pb-20 pt-36">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/account/bookings"
          className="text-sm text-black/50"
        >
          ← My bookings
        </Link>

        <div className="mt-5 rounded-3xl border bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[.25em] text-[#a35b36]">
                Booking details
              </p>

              <h1 className="mt-2 font-serif text-4xl">
                {booking.tourSnapshot?.title || 'Tour booking'}
              </h1>
            </div>

            <span className="rounded-full bg-[#faf8f4] px-3 py-1 text-xs capitalize">
              {booking.status}
            </span>
          </div>

          <div className="mt-8 grid gap-5 border-t pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-black/40">Travel date</p>
              <p className="mt-1">
                {new Date(booking.travelDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-black/40">Travellers</p>
              <p className="mt-1">{booking.travellers}</p>
            </div>

            <div>
              <p className="text-xs text-black/40">
                Price per traveller
              </p>
              <p className="mt-1">
                ₹{Number(booking.pricePerPerson).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <p className="text-xs text-black/40">Total</p>
              <p className="mt-1 font-semibold">
                ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <p className="text-xs text-black/40">Contact</p>
              <p className="mt-1">
                {booking.contact?.name}
                <br />
                {booking.contact?.email}
                <br />
                {booking.contact?.phone}
              </p>
            </div>

            <div>
              <p className="text-xs text-black/40">Booking ID</p>
              <p className="mt-1 break-all font-mono text-xs">
                {booking._id}
              </p>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="mt-6 border-t pt-6">
              <p className="text-xs text-black/40">
                Special requests
              </p>

              <p className="mt-2 text-sm leading-7">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {booking.cancellationReason && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Cancellation reason: {booking.cancellationReason}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {canCancel && (
            <div className="mt-8 border-t pt-6">
              <label className="text-xs font-semibold">
                Cancellation reason (optional)

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={1000}
                  className="mt-2 min-h-24 w-full rounded-xl border p-3 text-sm"
                />
              </label>

              <button
                disabled={busy}
                onClick={cancel}
                className="mt-3 rounded-xl border border-red-200 px-5 py-3 text-sm text-red-700 disabled:opacity-50"
              >
                {busy ? 'Cancelling…' : 'Cancel booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}