'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

type BookingFormProps = {
  tour: {
    slug: string;
    title: string;
    price: number;
  };
};

export default function BookingForm({ tour }: BookingFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    travelDate: '',
    travellers: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const updateField = (
    field: keyof typeof form,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');

    const token = localStorage.getItem('ume_token');

    if (!token) {
      router.push(`/auth/login?next=/tours/${tour.slug}`);
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          tour: tour.slug,
          travelDate: form.travelDate,
          travellers: Number(form.travellers),
          contact: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          specialRequests: form.specialRequests,
        }),
      });

      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Booking request failed');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice =
    tour.price * Number(form.travellers || 1);

  if (done) {
    return (
      <div className="mt-5 rounded-2xl border border-[#d9e8d9] bg-[#f7fbf7] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4d7b4d]">
          Booking Request Received
        </p>

        <h3 className="mt-2 font-serif text-2xl text-[#1b1917]">
          We have your request.
        </h3>

        <p className="mt-2 text-sm leading-6 text-black/55">
          Your booking request has been submitted successfully.
          You can track it from My Bookings.
        </p>

        <button
          type="button"
          onClick={() => router.push('/account/bookings')}
          className="mt-5 inline-flex items-center rounded-xl bg-[#B76B43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#934F30]"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 space-y-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_10px_35px_rgba(27,25,23,0.05)] sm:p-6"
    >
      {/* Heading */}
      <div className="border-b border-black/[0.07] pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B76B43]">
          Reserve Your Journey
        </p>

        <h3 className="mt-1 font-serif text-2xl text-[#1b1917]">
          Request this tour
        </h3>

        <p className="mt-1 text-sm text-black/50">
          Share your travel details and our team will get back to you.
        </p>
      </div>

      {/* Date + Travellers */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
            Travel Date
          </label>

          <input
            required
            type="date"
            min={new Date(Date.now() + 86400000)
              .toISOString()
              .slice(0, 10)}
            value={form.travelDate}
            onChange={(e) =>
              updateField('travelDate', e.target.value)
            }
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition placeholder:text-black/35 focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
            Travellers
          </label>

          <input
            required
            min={1}
            max={50}
            type="number"
            value={form.travellers}
            onChange={(e) =>
              updateField(
                'travellers',
                Math.max(1, Number(e.target.value))
              )
            }
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
          />
        </div>
      </div>

      {/* Name + Email */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
            Full Name
          </label>

          <input
            required
            value={form.name}
            onChange={(e) =>
              updateField('name', e.target.value)
            }
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition placeholder:text-black/35 focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
            Email
          </label>

          <input
            required
            type="email"
            value={form.email}
            onChange={(e) =>
              updateField('email', e.target.value)
            }
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition placeholder:text-black/35 focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
          Phone / WhatsApp
        </label>

        <input
          required
          value={form.phone}
          onChange={(e) =>
            updateField('phone', e.target.value)
          }
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition placeholder:text-black/35 focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
          placeholder="+91 98765 43210"
        />
      </div>

      {/* Special Requests */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#1b1917]">
          Special Requests
          <span className="ml-1 font-normal text-black/40">
            (Optional)
          </span>
        </label>

        <textarea
          value={form.specialRequests}
          onChange={(e) =>
            updateField('specialRequests', e.target.value)
          }
          className="min-h-28 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1b1917] outline-none transition placeholder:text-black/35 focus:border-[#B76B43] focus:ring-2 focus:ring-[#B76B43]/10"
          placeholder="Tell us about your preferences, hotel requirements, dietary needs, etc."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm leading-5 text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center justify-between border-t border-black/[0.07] pt-4">
        <div>
          <p className="text-xs text-black/45">
            Estimated total
          </p>

          <p className="mt-0.5 font-serif text-2xl text-[#1b1917]">
            ₹{totalPrice.toLocaleString('en-IN')}
          </p>
        </div>

        <p className="text-xs text-black/45">
          {Number(form.travellers || 1)}{' '}
          {Number(form.travellers || 1) === 1
            ? 'traveller'
            : 'travellers'}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#B76B43] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#934F30] hover:shadow-[0_10px_25px_rgba(183,107,67,0.2)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Sending Request...
          </>
        ) : (
          `Request Booking · ₹${totalPrice.toLocaleString('en-IN')}`
        )}
      </button>

      <p className="text-center text-[11px] leading-5 text-black/40">
        No payment is required at this stage. Our travel team will
        contact you to confirm availability and details.
      </p>
    </form>
  );
}