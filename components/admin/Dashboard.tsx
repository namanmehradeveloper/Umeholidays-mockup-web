'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart3, CalendarDays, FileText, RefreshCw, Users } from 'lucide-react';
import { api } from '../../lib/admin-api';

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'lastMonth' | 'year';

const RANGE_LABELS: Record<RangeKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  month: 'This Month',
  lastMonth: 'Last Month',
  year: 'This Year',
};

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFor(key: RangeKey) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (key === 'today') {
    // same day
  } else if (key === 'yesterday') {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (key === '7d') {
    start.setDate(start.getDate() - 6);
  } else if (key === '30d') {
    start.setDate(start.getDate() - 29);
  } else if (key === 'month') {
    start.setDate(1);
  } else if (key === 'lastMonth') {
    start.setMonth(start.getMonth() - 1, 1);
    end.setDate(0);
  } else if (key === 'year') {
    start.setMonth(0, 1);
  }
  return { from: iso(start), to: iso(end) };
}

const inr = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#64748B]">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff8f3] text-[#b76b43]"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0F172A]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function TrendBars({ points }: { points: Array<{ _id: string; bookings: number; revenue: number }> }) {
  const max = Math.max(1, ...points.map((p) => Number(p.bookings || 0)));
  if (!points.length) return <div className="grid h-56 place-items-center text-sm text-[#94A3B8]">No booking data for this period.</div>;
  return (
    <div className="flex h-64 items-end gap-2 overflow-x-auto pb-5 pt-6">
      {points.map((point) => (
        <div key={point._id} className="group flex min-w-8 flex-1 flex-col items-center justify-end gap-2">
          <div className="relative w-full max-w-10 rounded-t-lg bg-[#b76b43]/80 transition-all group-hover:bg-[#b76b43]" style={{ height: `${Math.max(5, (Number(point.bookings || 0) / max) * 170)}px` }} title={`${point.bookings} bookings · ${inr(point.revenue)}`}>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-[#64748B]">{point.bookings}</span>
          </div>
          <span className="text-[9px] text-[#94A3B8]">{point._id.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [range, setRange] = useState<RangeKey>('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setError('');
      const response = await api<{ data: any }>('/admin/dashboard');
      setDashboard(response.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const selected = custom.from && custom.to ? custom : rangeFor(range);
      const response = await api<{ data: any }>(`/admin/analytics?from=${encodeURIComponent(selected.from)}&to=${encodeURIComponent(selected.to)}`);
      setAnalytics(response.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [range, custom.from, custom.to]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);
  useEffect(() => { void loadAnalytics(); }, [loadAnalytics]);

  const contentRows = useMemo(() => Object.entries(dashboard?.content || {}) as Array<[string, any]>, [dashboard]);

  if (loading && !dashboard) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-[#64748B]">Loading admin dashboard…</div>;
  }

  if (error && !dashboard) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><button onClick={() => { void loadDashboard(); }} className="mt-3 rounded-lg bg-white px-4 py-2 font-semibold ring-1 ring-red-200">Retry</button></div>;
  }

  const users = dashboard?.users || {};
  const bookings = dashboard?.bookings || {};
  const enquiries = dashboard?.enquiries || {};
  const aBookings = analytics?.bookings || {};
  const aUsers = analytics?.users || {};

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#64748B]">Overview</p>
          <h1 className="mt-2 font-serif text-4xl text-[#0F172A]">Dashboard & Analytics</h1>
        </div>
        <button type="button" onClick={() => { void loadDashboard(); void loadAnalytics(); }} disabled={loading || analyticsLoading} className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] shadow-sm disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading || analyticsLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <div className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={users.total ?? 0} hint={`${users.active ?? 0} active · ${users.inactive ?? 0} inactive`} icon={Users} />
        <StatCard label="Total Bookings" value={bookings.total ?? 0} hint={`${bookings.byStatus?.confirmed || 0} confirmed · ${bookings.byStatus?.cancelled || 0} cancelled`} icon={CalendarDays} />
        <StatCard label="Total Enquiries" value={enquiries.total ?? 0} hint={`${enquiries.byStatus?.new || 0} new · ${enquiries.byStatus?.converted || 0} converted`} icon={FileText} />
      </div>

      <section className="mt-7 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#64748B]">Analytics period</p><h2 className="mt-1 font-serif text-2xl">Performance</h2></div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => <button key={key} type="button" onClick={() => { setCustom({ from: '', to: '' }); setRange(key); }} className={`rounded-lg px-3 py-2 text-xs font-semibold ${range === key && !custom.from ? 'bg-[#b76b43] text-white' : 'bg-[#F8FAFC] text-[#64748B] ring-1 ring-[#E2E8F0]'}`}>{RANGE_LABELS[key]}</button>)}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 max-w-full flex-nowrap items-end gap-3">
            <label className="min-w-0 flex-1 text-xs font-medium text-[#64748B] sm:flex-none">From<input type="date" value={custom.from} onChange={(e) => setCustom((x) => ({ ...x, from: e.target.value }))} className="mt-1 block w-full min-w-0 rounded-lg border border-[#E2E8F0] px-2 py-2 text-sm sm:px-3" /></label>
            <label className="min-w-0 flex-1 text-xs font-medium text-[#64748B] sm:flex-none">To<input type="date" value={custom.to} onChange={(e) => setCustom((x) => ({ ...x, to: e.target.value }))} className="mt-1 block w-full min-w-0 rounded-lg border border-[#E2E8F0] px-2 py-2 text-sm sm:px-3" /></label>
          </div>
          {custom.from && custom.to && <span className="pb-2 text-xs text-[#64748B]">Custom range applied</span>}
        </div>

        {analyticsLoading ? <div className="grid h-56 place-items-center text-sm text-[#94A3B8]">Calculating analytics…</div> : (
          <div className="mt-6 w-full rounded-xl bg-[#F8FAFC] p-4"><div className="mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#b76b43]" /><h3 className="font-semibold">Booking trend</h3></div><TrendBars points={aBookings.trend || []} /></div>
        )}
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl">Booking status</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(bookings.byStatus || {}).map(([key, value]) => <div key={key} className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs capitalize text-[#64748B]">{key}</p><p className="mt-1 text-xl font-semibold">{String(value)}</p></div>)}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl">Lead funnel</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {['new', 'contacted', 'qualified', 'quoted', 'converted', 'closed'].map((key) => <div key={key} className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs capitalize text-[#64748B]">{key}</p><p className="mt-1 text-xl font-semibold">{String(enquiries.byStatus?.[key] || 0)}</p></div>)}
          </div>
        </section>
      </div>

      <section className="mt-7 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#64748B]">CMS</p><h2 className="mt-1 font-serif text-2xl">Content overview</h2></div><span className="text-xs text-[#94A3B8]">{contentRows.length} modules</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {contentRows.map(([key, value]) => <div key={key} className="rounded-xl border border-[#E2E8F0] p-4"><p className="text-sm font-semibold capitalize">{key}</p><p className="mt-2 text-xl font-semibold">{value.total || 0}</p><p className="mt-1 text-xs text-[#64748B]">{value.published !== undefined ? `${value.published} published · ${value.drafts || 0} drafts` : `${value.active || 0} active · ${value.inactive || 0} inactive`}</p><p className="mt-1 text-[11px] text-[#94A3B8]">{value.missingImage ? `${value.missingImage} missing image` : ''}{value.missingDescription ? ` · ${value.missingDescription} missing description` : ''}{value.missingSeo ? ` · ${value.missingSeo} missing SEO` : ''}</p></div>)}
        </div>
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl">Recent bookings</h2><div className="mt-4 space-y-3">{(dashboard?.recent?.bookings || []).map((x: any) => <div key={x._id} className="rounded-xl bg-[#F8FAFC] p-3"><div className="flex justify-between gap-3"><b className="truncate">{x.tourSnapshot?.title || 'Tour'}</b><span className="text-xs capitalize">{x.status}</span></div><p className="mt-1 text-xs text-[#64748B]">{x.contact?.name} · {x.travellers} travellers · {inr(x.totalAmount)}</p></div>)}</div></section>
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl">Recent enquiries</h2><div className="mt-4 space-y-3">{(dashboard?.recent?.enquiries || []).map((x: any) => <div key={x._id} className="rounded-xl bg-[#F8FAFC] p-3"><div className="flex justify-between gap-3"><b>{x.name}</b><span className="text-xs capitalize">{x.status}</span></div><p className="mt-1 text-xs text-[#64748B]">{x.destination || 'Custom'} · {x.email}</p></div>)}</div></section>
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"><h2 className="font-serif text-2xl">Recent admin activity</h2><div className="mt-4 space-y-3">{(dashboard?.recent?.activity || []).map((x: any) => <div key={x._id} className="rounded-xl bg-[#F8FAFC] p-3"><div className="flex justify-between gap-3"><b className="capitalize">{x.action}</b><span className="text-[11px] text-[#94A3B8]">{x.module}</span></div><p className="mt-1 text-xs text-[#64748B]">{x.admin?.name || x.admin?.email || 'Admin'} · {x.createdAt ? new Date(x.createdAt).toLocaleString() : ''}</p></div>)}</div></section>
      </div>

      <section className="mt-7 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h2 className="font-serif text-2xl">Users overview</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs text-[#64748B]">Active users</p><p className="mt-1 text-xl font-semibold">{users.active || 0}</p></div>
          <div className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs text-[#64748B]">Inactive users</p><p className="mt-1 text-xl font-semibold">{users.inactive || 0}</p></div>
          <div className="rounded-xl bg-[#F8FAFC] p-4"><p className="text-xs text-[#64748B]">New in selected period</p><p className="mt-1 text-xl font-semibold">{aUsers.newUsers || 0}</p></div>
        </div>
      </section>
    </div>
  );
}
