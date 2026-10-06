'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/admin-api';
import { FilterMenu, matchesQuery, RefreshButton, SearchField } from './TableControls';

export default function AuditLogs() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api('/admin/audit-logs?limit=100')
      .then(r => setItems(r.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const modules = Array.from(new Set(items.map(x => x.module).filter(Boolean))) as string[];
  const visible = items.filter(x => (moduleFilter === 'all' || x.module === moduleFilter) && matchesQuery(query, x.action, x.module, x.admin?.name, x.admin?.email, x.recordId));

  return (
    <>
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[.25em] text-[#6B7280]">System</p>
        <h1 className="mt-2 font-serif text-4xl">Audit Logs</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Administrative actions recorded by the backend.</p>
      </div>
      <div className="mb-5 flex gap-2">
        <SearchField value={query} onChange={e => setQuery(e.target.value)} placeholder="Search action, admin or record…" />
        <FilterMenu label="Module" value={moduleFilter} onChange={setModuleFilter} options={[{ value: 'all', label: 'All modules' }, ...modules.map(m => ({ value: m, label: m }))]} />
        <RefreshButton onClick={load} loading={loading} />
      </div>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr className="border-b bg-[#F8FAFC]">
            {['Time', 'Admin', 'Action', 'Module', 'Record'].map(x => <th key={x} className="px-4 py-3 text-xs uppercase tracking-wider">{x}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center">Loading…</td></tr> :
              visible.map(x => <tr key={x._id} className="border-b last:border-0">
                <td className="px-4 py-4">{new Date(x.createdAt).toLocaleString()}</td>
                <td className="px-4 py-4">{x.admin?.name || x.admin?.email || 'Admin'}</td>
                <td className="px-4 py-4 font-medium">{x.action}</td>
                <td className="px-4 py-4">{x.module}</td>
                <td className="px-4 py-4 font-mono text-xs">{x.recordId || '—'}</td>
              </tr>)
            }
            {!loading && !visible.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-[#6B7280]">{items.length ? 'No matching events.' : 'No audit events yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
