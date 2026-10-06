'use client';

import { useEffect, useState } from 'react';
import {
  Copy,
  Download,
  Mail,
  Phone,
  RefreshCw,
  Search,
} from 'lucide-react';

import { api, downloadAdminCsv } from '../../lib/admin-api';

import {
  DetailsDialog,
  matchesQuery,
  RowActions,
} from './TableControls';

const STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];

const PAYMENTS = [
  'unpaid',
  'paid',
  'refunded',
];

const inr = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

function statusClass(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';

    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';

    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-100';

    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-100';

    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
}

function paymentClass(payment: string) {
  switch (payment) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';

    case 'refunded':
      return 'bg-purple-50 text-purple-700 border-purple-100';

    case 'unpaid':
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
}

export default function Bookings() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [viewing, setViewing] = useState<any | null>(null);

  /* =====================================================
     LOAD BOOKINGS
  ===================================================== */

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '200',
        page: '1',
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      if (paymentFilter !== 'all') {
        params.set('paymentStatus', paymentFilter);
      }

      if (from) {
        params.set('from', from);
      }

      if (to) {
        params.set('to', to);
      }

      const first = await api<{
        data?: any[];
        meta?: {
          pages?: number;
        };
      }>(`/bookings?${params.toString()}`);

      const all = [...(first.data || [])];

      const pages = Math.max(
        1,
        Number(first.meta?.pages) || 1
      );

      for (let page = 2; page <= pages; page += 1) {
        params.set('page', String(page));

        const next = await api<{
          data?: any[];
        }>(`/bookings?${params.toString()}`);

        all.push(...(next.data || []));
      }

      setItems(all);
    } catch (e: any) {
      setError(
        e?.message || 'Failed to load bookings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter, paymentFilter]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const update = async (
    id: string,
    status: string
  ) => {
    try {
      setError('');
      setUpdatingId(id);

      await api(`/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
        }),
      });

      await load();
    } catch (e: any) {
      setError(
        e?.message ||
          'Failed to update booking'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================================================
     EXPORT
  ===================================================== */

  const exportData = async () => {
    setExporting(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '200',
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      if (statusFilter !== 'all') {
        params.set(
          'status',
          statusFilter
        );
      }

      if (paymentFilter !== 'all') {
        params.set(
          'paymentStatus',
          paymentFilter
        );
      }

      if (from) {
        params.set('from', from);
      }

      if (to) {
        params.set('to', to);
      }

      await downloadAdminCsv(
        `/bookings?${params.toString()}`,
        `ume-bookings-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
    } catch (e: any) {
      setError(
        e?.message || 'Nothing to export'
      );
    } finally {
      setExporting(false);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const visible = items.filter((x) =>
    matchesQuery(
      query,
      x._id,
      x.tourSnapshot?.title,
      x.contact?.name,
      x.contact?.email,
      x.contact?.phone
    )
  );

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setFrom('');
    setTo('');

    setTimeout(() => {
      void load();
    }, 0);
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#64748B]">
            Commerce
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#0F172A]">
            Bookings
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Search, filter and manage customer bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void exportData()}
          disabled={exporting}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#334155] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />

          {exporting
            ? 'Exporting…'
            : 'Export CSV'}
        </button>
      </div>

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <div className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Booking Filters
            </h2>

            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Search and narrow down bookings
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-[#64748B] transition hover:text-[#b76b43]"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {/* SEARCH */}

          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Search
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                type="text"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void load();
                  }
                }}
                placeholder="Booking ID, tour, customer..."
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#b76b43] focus:bg-white focus:ring-2 focus:ring-[#b76b43]/10"
              />
            </div>
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm capitalize text-[#334155] outline-none transition focus:border-[#b76b43] focus:bg-white focus:ring-2 focus:ring-[#b76b43]/10"
            >
              <option value="all">
                All Status
              </option>

              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* PAYMENT */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              Payment
            </label>

            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm capitalize text-[#334155] outline-none transition focus:border-[#b76b43] focus:bg-white focus:ring-2 focus:ring-[#b76b43]/10"
            >
              <option value="all">
                All Payments
              </option>

              {PAYMENTS.map((payment) => (
                <option
                  key={payment}
                  value={payment}
                >
                  {payment}
                </option>
              ))}
            </select>
          </div>

          {/* FROM DATE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              From Date
            </label>

            <input
              aria-label="From travel date"
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#334155] outline-none transition focus:border-[#b76b43] focus:bg-white focus:ring-2 focus:ring-[#b76b43]/10"
            />
          </div>

          {/* TO DATE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              To Date
            </label>

            <input
              aria-label="To travel date"
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#334155] outline-none transition focus:border-[#b76b43] focus:bg-white focus:ring-2 focus:ring-[#b76b43]/10"
            />
          </div>
        </div>

        {/* FILTER ACTIONS */}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#F1F5F9] pt-4">
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#b76b43] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#934f30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}

            {loading
              ? 'Loading...'
              : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
            className="font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          TABLE HEADER
      ================================================= */}

      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">
            Booking Records
          </p>

          <p className="text-xs text-[#94A3B8]">
            {loading
              ? 'Loading records...'
              : `${visible.length} booking${
                  visible.length === 1
                    ? ''
                    : 's'
                } found`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh
        </button>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {[
                  'Booking ID',
                  'Customer',
                  'Tour / Event',
                  'Travel Date',
                  'Travellers',
                  'Amount',
                  'Payment',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#64748B]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visible.map((x) => {
                const payment =
                  x.paymentStatus ||
                  'unpaid';

                const status =
                  x.status || 'pending';

                return (
                  <tr
                    key={x._id}
                    className="border-b border-[#F1F5F9] transition last:border-0 hover:bg-[#FAFBFC]"
                  >
                    {/* BOOKING ID */}

                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-[#F8FAFC] px-2 py-1 font-mono text-xs font-medium text-[#475569]">
                        {String(
                          x._id
                        ).slice(-10)}
                      </span>
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-4 py-4">
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-[#0F172A]">
                          {x.contact?.name ||
                            x.user?.name ||
                            '—'}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {x.contact?.email ||
                            x.user?.email ||
                            '—'}
                        </p>

                        <p className="mt-0.5 text-xs text-[#94A3B8]">
                          {x.contact?.phone ||
                            '—'}
                        </p>
                      </div>
                    </td>

                    {/* TOUR */}

                    <td className="px-4 py-4">
                      <p className="max-w-[210px] font-medium text-[#334155]">
                        {x.tourSnapshot?.title ||
                          'Tour'}
                      </p>
                    </td>

                    {/* TRAVEL DATE */}

                    <td className="whitespace-nowrap px-4 py-4 text-[#475569]">
                      {x.travelDate
                        ? new Date(
                            x.travelDate
                          ).toLocaleDateString(
                            'en-IN'
                          )
                        : '—'}
                    </td>

                    {/* TRAVELLERS */}

                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#475569]">
                        {x.travellers ??
                          '—'}
                      </span>
                    </td>

                    {/* AMOUNT */}

                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#0F172A]">
                      {inr(
                        x.totalAmount
                      )}
                    </td>

                    {/* PAYMENT */}

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${paymentClass(
                          payment
                        )}`}
                      >
                        {payment}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                        <select
                          value={status}
                          disabled={
                            updatingId ===
                            x._id
                          }
                          onChange={(e) =>
                            void update(
                              x._id,
                              e.target.value
                            )
                          }
                          aria-label={`Change booking status for ${x._id}`}
                          className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-xs capitalize text-[#475569] outline-none focus:border-[#b76b43]"
                        >
                          {STATUSES.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-4">
                      <RowActions
                        onView={() =>
                          setViewing(x)
                        }
                        more={[
                          ...(x.contact?.email
                            ? [
                                {
                                  label:
                                    'Email customer',
                                  icon: Mail,
                                  href: `mailto:${x.contact.email}`,
                                },
                              ]
                            : []),

                          ...(x.contact?.phone
                            ? [
                                {
                                  label:
                                    'Call customer',
                                  icon: Phone,
                                  href: `tel:${x.contact.phone}`,
                                },
                              ]
                            : []),

                          {
                            label:
                              'Copy booking ID',
                            icon: Copy,
                            copy: String(
                              x._id
                            ),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* EMPTY */}

              {!loading &&
                !visible.length && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC]">
                          <Search className="h-5 w-5 text-[#94A3B8]" />
                        </div>

                        <p className="font-semibold text-[#334155]">
                          No bookings found
                        </p>

                        <p className="mt-1 text-sm text-[#94A3B8]">
                          Try changing your search
                          or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="mb-3 h-6 w-6 animate-spin text-[#b76b43]" />

                      <p className="text-sm font-medium text-[#475569]">
                        Loading bookings...
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          BOOKING DETAILS
      ================================================= */}

      {viewing && (
        <DetailsDialog
          title="Booking details"
          subtitle={
            viewing.tourSnapshot?.title
          }
          onClose={() =>
            setViewing(null)
          }
          rows={[
            [
              'Booking ID',
              <span
                key="booking-id"
                className="font-mono text-xs"
              >
                {viewing._id}
              </span>,
            ],

            [
              'Tour',
              viewing.tourSnapshot?.title ||
                '—',
            ],

            [
              'Duration',
              viewing.tourSnapshot?.duration ||
                '—',
            ],

            [
              'Customer',
              viewing.contact?.name ||
                viewing.user?.name ||
                '—',
            ],

            [
              'Email',
              viewing.contact?.email ||
                viewing.user?.email ||
                '—',
            ],

            [
              'Phone',
              viewing.contact?.phone ||
                viewing.user?.phone ||
                '—',
            ],

            [
              'Travel date',
              viewing.travelDate
                ? new Date(
                    viewing.travelDate
                  ).toLocaleDateString(
                    'en-IN'
                  )
                : '—',
            ],

            [
              'Travellers',
              viewing.travellers ??
                '—',
            ],

            [
              'Price / person',
              inr(
                viewing.pricePerPerson
              ),
            ],

            [
              'Total',
              inr(
                viewing.totalAmount
              ),
            ],

            [
              'Status',
              viewing.status ||
                '—',
            ],

            [
              'Payment',
              viewing.paymentStatus ||
                'unpaid',
            ],

            [
              'Special requests',
              viewing.specialRequests ||
                '—',
            ],

            ...(viewing.cancellationReason
              ? [
                  [
                    'Cancellation reason',
                    viewing.cancellationReason,
                  ] as [
                    string,
                    string
                  ],
                ]
              : []),

            [
              'Booked on',
              viewing.createdAt
                ? new Date(
                    viewing.createdAt
                  ).toLocaleString(
                    'en-IN'
                  )
                : '—',
            ],
          ]}
        />
      )}
    </>
  );
}