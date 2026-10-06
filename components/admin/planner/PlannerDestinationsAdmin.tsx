'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { api } from '../../../lib/admin-api';
import { RefreshButton } from '../TableControls';
import { Notice, PRIMARY_BTN, SECONDARY_BTN, TextInput, Toggle } from './shared';

type Row = {
  _id: string;
  name: string;
  slug: string;
  heroImage?: string;
  isPublished?: boolean;
  plannerEnabled?: boolean;
  plannerBasePrice?: number;
  plannerSortOrder?: number;
};

type Draft = { plannerBasePrice: string; plannerSortOrder: string };

export default function PlannerDestinationsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ data?: Row[] }>('/destinations?limit=200');
      const data = (response.data || []).sort(
        (a, b) => (a.plannerSortOrder || 0) - (b.plannerSortOrder || 0) || a.name.localeCompare(b.name),
      );
      setRows(data);
      setDrafts(
        Object.fromEntries(
          data.map((row) => [row._id, { plannerBasePrice: String(row.plannerBasePrice ?? 0), plannerSortOrder: String(row.plannerSortOrder ?? 0) }]),
        ),
      );
    } catch (e: any) {
      setError(e.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (row: Row, body: Record<string, unknown>, message: string) => {
    setBusy(row._id);
    setError('');
    setNotice('');
    try {
      await api(`/destinations/${row._id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setNotice(message);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to update destination');
    } finally {
      setBusy(null);
    }
  };

  const saveDraft = (row: Row) => {
    const draft = drafts[row._id];
    const basePrice = Number(draft.plannerBasePrice);
    const sortOrder = Number(draft.plannerSortOrder);
    if (!Number.isFinite(basePrice) || basePrice < 0) return setError(`${row.name}: base price must be 0 or more`);
    if (!Number.isFinite(sortOrder)) return setError(`${row.name}: order must be a number`);
    void patch(row, { plannerBasePrice: basePrice, plannerSortOrder: sortOrder }, `${row.name} pricing saved.`);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-[#64748B]">
          A destination appears in the planner only when it is <strong>published</strong> and <strong>enabled for planning</strong>. Name, image and
          short description (tagline) come from the destination record. Base price is charged per adult per day. The same switch controls the
          destination choices of the homepage Trip Planner, which is hidden while no destination is enabled.
        </p>
        <div className="flex gap-2">
          <RefreshButton onClick={() => void load()} loading={loading} />
          <Link href="/admin/destinations" className={SECONDARY_BTN}>
            Manage destinations <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#6B7280]">
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">In planner</th>
              <th className="px-4 py-3">Base price / adult / day (₹)</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const draft = drafts[row._id] || { plannerBasePrice: '0', plannerSortOrder: '0' };
              const live = row.isPublished !== false && row.plannerEnabled;
              return (
                <tr key={row._id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.heroImage} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : null}
                      <div>
                        <p className="font-semibold">{row.name}</p>
                        <p className={`text-xs ${live ? 'text-emerald-600' : 'text-[#94A3B8]'}`}>{live ? 'Visible in planner' : 'Hidden from planner'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isPublished !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.isPublished !== false ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={Boolean(row.plannerEnabled)}
                      disabled={busy === row._id}
                      label={`Show ${row.name} in planner`}
                      onChange={(on) => void patch(row, { plannerEnabled: on }, `${row.name} ${on ? 'enabled for' : 'removed from'} the planner.`)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TextInput
                      type="number"
                      min={0}
                      value={draft.plannerBasePrice}
                      onChange={(e) => setDrafts({ ...drafts, [row._id]: { ...draft, plannerBasePrice: e.target.value } })}
                      className="max-w-[160px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TextInput
                      type="number"
                      value={draft.plannerSortOrder}
                      onChange={(e) => setDrafts({ ...drafts, [row._id]: { ...draft, plannerSortOrder: e.target.value } })}
                      className="max-w-[90px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" disabled={busy === row._id} onClick={() => saveDraft(row)} className={PRIMARY_BTN}>
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && !rows.length ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#6B7280]">
                  No destinations yet. Create one under Content → Destinations.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
