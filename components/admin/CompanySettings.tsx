'use client';

import { useEffect, useState } from 'react';
import { Building2, Facebook, Globe, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Sparkles, Youtube } from 'lucide-react';
import { api } from '../../lib/admin-api';
import InputIcon from './InputIcon';

const fields = [
  ['companyName', 'Company name', Building2],
  ['tagline', 'Tagline', Sparkles],
  ['email', 'Email', Mail],
  ['phone', 'Phone', Phone],
  ['whatsapp', 'WhatsApp number', MessageCircle],
  ['address', 'Address', MapPin],
  ['siteUrl', 'Production website URL', Globe],
  ['instagram', 'Instagram URL', Instagram],
  ['facebook', 'Facebook URL', Facebook],
  ['youtube', 'YouTube URL', Youtube],
  ['linkedin', 'LinkedIn URL', Linkedin],
] as const;

export default function CompanySettings() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/settings/admin')
      .then((result) => setForm(result.data || {}))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const result = await api('/settings/admin', { method: 'PATCH', body: JSON.stringify(form) });
      setForm(result.data || form);
      setMessage('Company settings saved. Public contact information will use these values.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-[#6B7280]">Loading company settings…</div>;

  return (
    <div>
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[.25em] text-[#6B7280]">Settings</p>
        <h1 className="mt-2 font-serif text-4xl">Company</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">One source of truth for the public company name, contact details and social links.</p>
      </div>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)] sm:grid-cols-2">
        {fields.map(([key, label, icon]) => (
          <label key={key} className="text-xs font-semibold">
            {label}
            <InputIcon icon={icon} className="mt-2">
              <input
                value={form[key] || ''}
                onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-3 text-sm font-normal text-[#111827] outline-none focus:border-[#b76b43]"
              />
            </InputIcon>
          </label>
        ))}
        <div className="sm:col-span-2">
          <button disabled={saving} className="rounded-xl bg-[#b76b43] px-6 py-3 text-sm text-white transition-colors hover:bg-[#934f30] disabled:opacity-50">
            {saving ? 'Saving…' : 'Save company settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
