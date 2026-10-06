'use client';

import { useEffect, useState } from 'react';
import { Copy, Download, Mail, Phone } from 'lucide-react';
import { api, downloadAdminCsv } from '../../lib/admin-api';
import { DetailsDialog, FilterMenu, matchesQuery, RefreshButton, RowActions, SearchField } from './TableControls';

const STATUSES = ['new', 'contacted', 'qualified', 'quoted', 'converted', 'closed'];

const SOURCES: Record<string, { label: string; className: string }> = {
  contact: { label: 'Contact Form', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
  'trip-planner': { label: 'Trip Planner', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  'plan-your-trip': { label: 'Plan Your Trip', className: 'bg-[#fff4ed] text-[#9c5735] ring-[#ead2c3]' },
  tour: { label: 'Tour', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  event: { label: 'Event', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  other: { label: 'Other', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

function SourceBadge({ source }: { source?: string }) {
  const meta = SOURCES[source || ''] || { label: source || '—', className: 'bg-slate-100 text-slate-700 ring-slate-200' };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>{meta.label}</span>;
}

const money = (amount?: number, currency = 'INR') =>
  amount === undefined || amount === null
    ? ''
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

function formatPreferences(value: unknown) {
  if (!value || typeof value !== 'object') return String(value ?? '');
  return Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join('\n');
}

function PlannerDetails({ planner }: { planner: any }) {
  const s = planner.snapshot || {};
  const p = planner.pricing || {};
  const currency = planner.currency || p.currency;
  const travellers = `${planner.adults} adult${planner.adults === 1 ? '' : 's'}${planner.children ? `, ${planner.children} child${planner.children === 1 ? '' : 'ren'}` : ''}`;
  const rows: Array<[string, string]> = [
    ['Destination', s.destination?.name],
    ['Duration', s.duration ? `${s.duration.label} (${s.duration.days} days / ${s.duration.nights} nights)` : ''],
    ['Travel style', s.travelStyle?.name],
    ['Travellers', travellers],
    ['Hotel', s.hotel?.name],
    ['Transport', s.transport?.name],
    ['Activities', (s.activities || []).map((a: any) => a.name).join(', ') || 'None'],
  ];
  const breakdown: Array<[string, number | undefined]> = [
    ['Destination base', p.destination],
    ['Hotel', p.hotel],
    ['Transport', p.transport],
    ['Activities', p.activities],
    [`Modifiers (${p.modifierPercent ?? 0}%)`, p.adjustments],
    [`Taxes (${p.taxPercent ?? 0}%)`, p.taxes],
  ];
  return (
    <div className="grid min-w-0 gap-5 md:grid-cols-2">
      <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[#64748B]">{label}</dt>
            <dd className="break-words font-semibold text-[#0F172A]">{value || '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-xl bg-[#F8FAFC] p-4 text-sm">
        {breakdown.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-0.5 text-[#475569]">
            <span>{label}</span>
            <span>{money(value ?? 0, currency)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2 font-bold text-[#0F172A]">
          <span>Estimated budget</span>
          <span>{money(planner.estimatedAmount, currency)}</span>
        </div>
        <p className="mt-2 text-xs text-[#94A3B8]">Calculated by the server from admin pricing at submission time.</p>
      </div>
    </div>
  );
}

export default function Enquiries() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '200', page: '1' });
      if (query.trim()) params.set('q', query.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const first = await api<{ data?: any[]; meta?: { pages?: number } }>(`/enquiries?${params}`);
      const all = [...(first.data || [])];
      const pages = Math.max(1, Number(first.meta?.pages) || 1);
      for (let page = 2; page <= pages; page += 1) {
        params.set('page', String(page));
        const next = await api<{ data?: any[] }>(`/enquiries?${params}`);
        all.push(...(next.data || []));
      }
      setItems(all);
    } catch (e: any) { setError(e.message || 'Failed to load enquiries'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [statusFilter, sourceFilter]);

  const update = async (id: string, status: string) => {
    try { await api(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); } catch (e: any) { setError(e.message); }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (query.trim()) params.set('q', query.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      await downloadAdminCsv(`/enquiries?${params}`, `ume-enquiries-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e: any) { setError(e.message || 'Nothing to export'); }
    finally { setExporting(false); }
  };

  const visible = items.filter(x => (statusFilter === 'all' || x.status === statusFilter) && matchesQuery(query, x.name, x.email, x.phone, x.destination, x.source));

  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.25em] text-[#6B7280]">CRM</p><h1 className="mt-2 font-serif text-4xl">Leads & Enquiries</h1><p className="mt-2 text-sm text-[#6B7280]">Manage every trip-planning request from the website.</p></div><button type="button" onClick={() => void exportData()} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><Download className="h-4 w-4" />{exporting ? "Exporting…" : "Export CSV"}</button></div>
    <div className="mb-5 flex flex-wrap gap-2">
      <SearchField value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void load(); }} placeholder="Search name, email or destination…" />
      <FilterMenu label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: s }))]} />
      <FilterMenu label="Source" value={sourceFilter} onChange={setSourceFilter} options={[{ value: 'all', label: 'All' }, ...Object.entries(SOURCES).map(([value, meta]) => ({ value, label: meta.label }))]} />
      <input aria-label="From date" type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm" />
      <input aria-label="To date" type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm" />
      <button type="button" onClick={() => void load()} className="rounded-xl bg-[#b76b43] px-4 py-2 text-sm font-semibold text-white">Apply</button>
      <RefreshButton onClick={() => void load()} loading={loading} />
    </div>
    {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead><tr className="border-b bg-[#F8FAFC]">{['Name', 'Contact', 'Destination', 'Dates', 'Source', 'Status', 'Created', 'Actions'].map(x => <th key={x} className="px-4 py-3 text-xs uppercase tracking-wider">{x}</th>)}</tr></thead>
        <tbody>
          {visible.map(x => <tr key={x._id} className="border-b">
            <td className="px-4 py-4 font-medium">{x.name}</td>
            <td className="px-4 py-4">{x.email}<br />{x.phone || ''}</td>
            <td className="px-4 py-4">{x.destination || 'Custom'}{x.planner ? <span className="mt-0.5 block text-xs text-[#64748B]">{x.planner.snapshot?.duration?.label} · {money(x.planner.estimatedAmount, x.planner.currency)}</span> : null}</td>
            <td className="px-4 py-4">{x.travelDates || '—'}</td>
            <td className="px-4 py-4"><SourceBadge source={x.source} /></td>
            <td className="px-4 py-4"><select value={x.status} onChange={e => update(x._id, e.target.value)} className="rounded-lg border px-2 py-1">{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
            <td className="px-4 py-4">{new Date(x.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-4"><RowActions onView={() => setViewing(x)} more={[
              ...(x.email ? [{ label: 'Reply by email', icon: Mail, href: `mailto:${x.email}` }] : []),
              ...(x.phone ? [{ label: 'Call', icon: Phone, href: `tel:${x.phone}` }] : []),
              { label: 'Copy enquiry ID', icon: Copy, copy: String(x._id) },
            ]} /></td>
          </tr>)}
          {!loading && !visible.length && <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6B7280]">No enquiries found.</td></tr>}
        </tbody>
      </table>
    </div>
    {viewing && <DetailsDialog title="Enquiry details" subtitle={viewing.name} onClose={() => setViewing(null)} rows={viewing.planner ? [
      ['Customer · Name', viewing.name],
      ['Customer · Email', viewing.email],
      ['Customer · Phone', viewing.phone],
      ['Planner details', <PlannerDetails key="planner" planner={viewing.planner} />],
      ['Message', viewing.message],
      ['Source', <SourceBadge key="source" source={viewing.source} />],
      ['Status', viewing.status],
      ['Submitted at', viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : ''],
      ['Linked account', viewing.user ? `${viewing.user.name || ''} ${viewing.user.email ? `(${viewing.user.email})` : ''}`.trim() : 'Guest'],
      ['Admin notes', viewing.adminNotes],
    ] : [
      ['Name', viewing.name],
      ['Email', viewing.email],
      ['Phone', viewing.phone],
      ['Destination', viewing.destination || 'Custom'],
      ['Travel dates', viewing.travelDates],
      ['Travellers', viewing.travellers],
      ['Source', <SourceBadge key="source" source={viewing.source} />],
      ['Related page', viewing.relatedSlug],
      ['Status', viewing.status],
      ['Message', viewing.message],
      ['Preferences', formatPreferences(viewing.preferences)],
      ['Admin notes', viewing.adminNotes],
      ['Received', viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : ''],
    ]} />}
  </>;
}
