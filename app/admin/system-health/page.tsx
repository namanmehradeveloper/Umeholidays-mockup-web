'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ServerCog, XCircle } from 'lucide-react';
import { api } from '../../../lib/admin-api';

export default function SystemHealthPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ data: any }>('/health');
      setData(response.data);
    } catch (e: any) {
      setError(e.message || 'Health check failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-[10px] uppercase tracking-[.25em] text-[#64748B]">System</p><h1 className="mt-2 font-serif text-4xl">System Health</h1><p className="mt-2 text-sm text-[#64748B]">Safe operational information only; private environment variables are never displayed.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
    </div>
    {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ['API', data?.status === 'ok' ? 'Operational' : error ? 'Unavailable' : 'Checking…', data?.status === 'ok'],
        ['MongoDB', data?.database === 'connected' ? 'Connected' : error ? 'Unavailable' : 'Checking…', data?.database === 'connected'],
        ['Environment', data?.environment || '—', true],
        ['Uptime', data ? `${Math.floor(Number(data.uptime || 0) / 3600)}h ${Math.floor((Number(data.uptime || 0) % 3600) / 60)}m` : '—', true],
      ].map(([label, value, healthy]) => <div key={String(label)} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#64748B]">{label}</p>{healthy === true ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : healthy === false ? <XCircle className="h-5 w-5 text-red-600" /> : <ServerCog className="h-5 w-5 text-[#64748B]" />}</div><p className="mt-3 text-xl font-semibold capitalize">{String(value)}</p></div>)}
    </div>
    {data?.timestamp && <p className="mt-5 text-xs text-[#94A3B8]">Last checked: {new Date(data.timestamp).toLocaleString('en-IN')}</p>}
  </div>;
}
