'use client';

import { useRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

import { api } from '../../../lib/admin-api';

export const INPUT =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#b76b43]/10 disabled:bg-[#F8FAFC]';

export const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#b76b43] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#934f30] disabled:opacity-50';

export const SECONDARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFC] disabled:opacity-50';

export function Field({ label, hint, required, children, wide }: { label: string; hint?: string; required?: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-sm font-bold text-[#111827]">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#6B7280]">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT} ${props.className || ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${INPUT} resize-y ${props.className || ''}`} />;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-[#E5E7EB]'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-4 rounded-xl border p-3 text-sm font-semibold ${
        tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {children}
    </div>
  );
}

export function Card({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
          {description ? <p className="mt-1 text-xs leading-5 text-[#64748B]">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function ImageInput({ value, onChange, folder }: { value: string; onChange: (value: string) => void; folder: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) return setError('Please select an image file.');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be 5MB or smaller.');
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', `ume-holidays/${folder}`);
      const response = await api<{ data?: { url?: string } }>('/uploads/image', { method: 'POST', body: fd });
      if (!response.data?.url) throw new Error('Upload succeeded but no image URL was returned.');
      onChange(response.data.url);
    } catch (e: any) {
      setError(e?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-[#E5E7EB] object-cover" />
      ) : (
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-dashed border-[#CBD5E1] text-[10px] text-[#94A3B8]">None</div>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" />
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = '';
              if (file) void upload(file);
            }}
          />
          <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className={SECONDARY_BTN}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <button type="button" disabled={!value || uploading} onClick={() => onChange('')} className={`${SECONDARY_BTN} text-red-600`}>
            Remove
          </button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

export const inr = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
