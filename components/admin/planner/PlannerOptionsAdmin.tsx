'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Plus, X } from 'lucide-react';

import { api } from '../../../lib/admin-api';
import { PLANNER_ICONS } from '../../../lib/planner';
import { RefreshButton, RowActions } from '../TableControls';
import { Field, ImageInput, Notice, PRIMARY_BTN, SECONDARY_BTN, TextArea, TextInput, inr } from './shared';

export type PlannerOptionTab = 'durations' | 'travel-styles' | 'hotels' | 'transport' | 'activities';

type FieldKey =
  | 'name'
  | 'description'
  | 'days'
  | 'nights'
  | 'priceModifier'
  | 'pricePerNight'
  | 'pricingType'
  | 'price'
  | 'pricePerPerson'
  | 'icon'
  | 'image'
  | 'destinationIds';

type FieldDef = { key: FieldKey; label: string; required?: boolean; hint?: string; placeholder?: string; min?: number; max?: number };

const NUMBER_FIELDS: FieldKey[] = ['days', 'nights', 'priceModifier', 'pricePerNight', 'price', 'pricePerPerson'];

const PRICING_TYPES = [
  { value: 'per_day', label: 'Per day (vehicle)' },
  { value: 'per_trip', label: 'Flat per trip' },
  { value: 'per_person', label: 'Per traveller' },
];

const modifier = (value: unknown) => {
  const n = Number(value) || 0;
  return n === 0 ? 'No price modifier' : `${n > 0 ? '+' : ''}${n}% on trip`;
};

const CONFIG: Record<PlannerOptionTab, { endpoint: string; title: string; singular: string; fields: FieldDef[]; summary: (x: any) => string }> = {
  durations: {
    endpoint: 'durations',
    title: 'Durations',
    singular: 'Duration',
    fields: [
      { key: 'name', label: 'Label', required: true, placeholder: '5 Days / 4 Nights' },
      { key: 'days', label: 'Days', required: true, min: 1, max: 60 },
      { key: 'nights', label: 'Nights', hint: 'Hotel nights are charged on this value. Defaults to days − 1.', min: 0, max: 60 },
      { key: 'priceModifier', label: 'Price modifier (%)', hint: 'Applied to the trip subtotal, e.g. −5 for long-stay discounts.', min: -90, max: 500 },
      { key: 'description', label: 'Description' },
    ],
    summary: (x) => `${x.days} days / ${x.nights} nights · ${modifier(x.priceModifier)}`,
  },
  'travel-styles': {
    endpoint: 'travel-styles',
    title: 'Travel Styles',
    singular: 'Travel Style',
    fields: [
      { key: 'name', label: 'Name', required: true, placeholder: 'Heritage' },
      { key: 'priceModifier', label: 'Price modifier (%)', hint: 'Applied to the trip subtotal, e.g. 25 for luxury handling.', min: -90, max: 500 },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
      { key: 'image', label: 'Image' },
    ],
    summary: (x) => modifier(x.priceModifier),
  },
  hotels: {
    endpoint: 'hotels',
    title: 'Hotels',
    singular: 'Hotel Category',
    fields: [
      { key: 'name', label: 'Name', required: true, placeholder: 'Luxury' },
      { key: 'pricePerNight', label: 'Price per room per night (₹)', required: true, min: 0 },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
      { key: 'image', label: 'Image' },
    ],
    summary: (x) => `${inr(x.pricePerNight)} per room / night`,
  },
  transport: {
    endpoint: 'transports',
    title: 'Transport',
    singular: 'Transport Option',
    fields: [
      { key: 'name', label: 'Name', required: true, placeholder: 'Private Sedan' },
      { key: 'pricingType', label: 'Pricing type', required: true },
      { key: 'price', label: 'Price (₹)', required: true, min: 0 },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
      { key: 'image', label: 'Image' },
    ],
    summary: (x) => `${inr(x.price)} ${PRICING_TYPES.find((p) => p.value === x.pricingType)?.label.toLowerCase() || ''}`,
  },
  activities: {
    endpoint: 'activities',
    title: 'Activities',
    singular: 'Activity',
    fields: [
      { key: 'name', label: 'Name', required: true, placeholder: 'Heritage walk' },
      { key: 'pricePerPerson', label: 'Price per person (₹)', required: true, min: 0 },
      { key: 'destinationIds', label: 'Destinations', hint: 'Leave all unticked to offer this activity at every planner destination.' },
      { key: 'description', label: 'Description' },
      { key: 'image', label: 'Image' },
    ],
    summary: (x) =>
      `${inr(x.pricePerPerson)} per person · ${
        x.destinationIds?.length ? x.destinationIds.map((d: any) => d?.name || 'Unknown').join(', ') : 'All destinations'
      }`,
  },
};

type FormState = Record<string, any>;

function toForm(fields: FieldDef[], record?: any): FormState {
  const form: FormState = {};
  for (const field of fields) {
    const value = record?.[field.key];
    if (field.key === 'destinationIds') form.destinationIds = (value || []).map((d: any) => String(d?._id || d));
    else if (field.key === 'pricingType') form.pricingType = value || 'per_day';
    else form[field.key] = value === undefined || value === null ? '' : String(value);
  }
  return form;
}

function toPayload(fields: FieldDef[], form: FormState) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = form[field.key];
    if (field.key === 'destinationIds') payload.destinationIds = value || [];
    else if (NUMBER_FIELDS.includes(field.key)) {
      if (String(value).trim() === '') {
        if (field.required) throw new Error(`${field.label} is required`);
        if (field.key === 'priceModifier') payload.priceModifier = 0;
        continue;
      }
      const number = Number(value);
      if (!Number.isFinite(number)) throw new Error(`${field.label} must be a number`);
      if (field.min !== undefined && number < field.min) throw new Error(`${field.label} must be at least ${field.min}`);
      if (field.max !== undefined && number > field.max) throw new Error(`${field.label} must be at most ${field.max}`);
      payload[field.key] = number;
    } else {
      const text = String(value ?? '').trim();
      if (field.required && !text) throw new Error(`${field.label} is required`);
      payload[field.key] = text;
    }
  }
  if (payload.days !== undefined && payload.nights !== undefined && Number(payload.nights) > Number(payload.days)) {
    throw new Error('Nights cannot exceed days');
  }
  return payload;
}

export default function PlannerOptionsAdmin({ tab }: { tab: PlannerOptionTab }) {
  const cfg = CONFIG[tab];
  const [items, setItems] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const base = `/planner/admin/options/${cfg.endpoint}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ data?: any[] }>(base);
      setItems(response.data || []);
      if (tab === 'activities') {
        const dest = await api<{ data?: any[] }>('/destinations?limit=200&sort=name');
        setDestinations(dest.data || []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  }, [base, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (record?: any) => {
    setEditing(record || null);
    setForm(toForm(cfg.fields, record));
    setFormError('');
    setOpen(true);
  };

  const save = async () => {
    try {
      setFormError('');
      const payload = toPayload(cfg.fields, form);
      setSaving(true);
      if (editing) await api(`${base}/${editing._id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api(base, { method: 'POST', body: JSON.stringify(payload) });
      setOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    setError('');
    try {
      await action();
      await load();
    } catch (e: any) {
      setError(e.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const ids = items.map((item) => item._id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void run(`move-${index}`, () => api(`${base}/reorder`, { method: 'POST', body: JSON.stringify({ ids }) }));
  };

  const set = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));

  const renderField = (field: FieldDef) => {
    const value = form[field.key];
    if (field.key === 'description') {
      return (
        <Field key={field.key} label={field.label} wide>
          <TextArea value={value} maxLength={1000} onChange={(e) => set('description', e.target.value)} />
        </Field>
      );
    }
    if (field.key === 'pricingType') {
      return (
        <Field key={field.key} label={field.label} required>
          <select value={value} onChange={(e) => set('pricingType', e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm">
            {PRICING_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      );
    }
    if (field.key === 'icon') {
      return (
        <Field key={field.key} label={field.label} wide>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => set('icon', '')}
              className={`rounded-lg border px-2.5 py-1.5 text-xs ${!value ? 'border-[#b76b43] bg-[#fff8f3] text-[#b76b43]' : 'border-[#E5E7EB]'}`}
            >
              None
            </button>
            {Object.entries(PLANNER_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                aria-pressed={value === name}
                onClick={() => set('icon', name)}
                className={`grid h-8 w-8 place-items-center rounded-lg border ${value === name ? 'border-[#b76b43] bg-[#fff8f3] text-[#b76b43]' : 'border-[#E5E7EB] text-[#475569]'}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </Field>
      );
    }
    if (field.key === 'image') {
      return (
        <Field key={field.key} label={field.label} wide>
          <ImageInput value={value || ''} onChange={(url) => set('image', url)} folder="planner" />
        </Field>
      );
    }
    if (field.key === 'destinationIds') {
      const selected: string[] = value || [];
      return (
        <Field key={field.key} label={field.label} hint={field.hint} wide>
          <div className="flex flex-wrap gap-2">
            {destinations.map((destination) => {
              const id = String(destination._id);
              const checked = selected.includes(id);
              return (
                <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${checked ? 'border-[#b76b43] bg-[#fff8f3]' : 'border-[#E5E7EB]'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => set('destinationIds', checked ? selected.filter((x) => x !== id) : [...selected, id])}
                  />
                  {destination.name}
                  {!destination.isPublished || !destination.plannerEnabled ? <span className="text-[10px] text-[#94A3B8]">(not in planner)</span> : null}
                </label>
              );
            })}
          </div>
        </Field>
      );
    }
    const numeric = NUMBER_FIELDS.includes(field.key);
    return (
      <Field key={field.key} label={field.label} hint={field.hint} required={field.required}>
        <TextInput
          type={numeric ? 'number' : 'text'}
          min={field.min}
          max={field.max}
          value={value}
          placeholder={field.placeholder}
          maxLength={numeric ? undefined : 120}
          onChange={(e) => set(field.key, e.target.value)}
        />
      </Field>
    );
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#64748B]">
          {items.filter((item) => item.status === 'active').length} active of {items.length}. Order here is the order shown in the planner.
        </p>
        <div className="flex gap-2">
          <RefreshButton onClick={() => void load()} loading={loading} />
          <button type="button" onClick={() => startEdit()} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" /> Add {cfg.singular}
          </button>
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#6B7280]">
              <th className="w-24 px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Pricing / details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const Icon = item.icon ? PLANNER_ICONS[item.icon] : undefined;
              return (
                <tr key={item._id} className="border-b last:border-0 hover:bg-[#FAFBFC]">
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" aria-label="Move up" disabled={index === 0 || Boolean(busy)} onClick={() => move(index, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#E5E7EB] disabled:opacity-30">
                        <ArrowUp size={13} />
                      </button>
                      <button type="button" aria-label="Move down" disabled={index === items.length - 1 || Boolean(busy)} onClick={() => move(index, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-[#E5E7EB] disabled:opacity-30">
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : Icon ? (
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff8f3] text-[#b76b43]">
                          <Icon size={16} />
                        </span>
                      ) : null}
                      <div>
                        <p className="font-semibold text-[#111827]">{item.name}</p>
                        {item.description ? <p className="max-w-xs truncate text-xs text-[#6B7280]">{item.description}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#334155]">{cfg.summary(item)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busy === `status-${item._id}`}
                      onClick={() =>
                        void run(`status-${item._id}`, () =>
                          api(`${base}/${item._id}`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'active' ? 'inactive' : 'active' }) }),
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 disabled:opacity-50 ${
                        item.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}
                    >
                      {item.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => startEdit(item)}
                      onDelete={() => {
                        if (confirm(`Delete "${item.name}"? Existing enquiries keep their saved snapshot.`)) {
                          void run(`delete-${item._id}`, () => api(`${base}/${item._id}`, { method: 'DELETE' }));
                        }
                      }}
                      more={[{ label: 'Copy ID', icon: Copy, copy: String(item._id) }]}
                    />
                  </td>
                </tr>
              );
            })}
            {!loading && !items.length ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[#6B7280]">
                  No {cfg.title.toLowerCase()} yet. The planner shows an unavailable message for this step until you add one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.16)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="font-serif text-2xl">
                {editing ? 'Edit' : 'New'} {cfg.singular}
              </h2>
              <button type="button" onClick={() => setOpen(false)} disabled={saving} aria-label="Close" className="text-2xl text-[#6B7280]">
                ×
              </button>
            </div>
            <div className="p-6">
              {formError ? <Notice tone="error">{formError}</Notice> : null}
              <div className="grid gap-5 sm:grid-cols-2">{cfg.fields.map(renderField)}</div>
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button type="button" onClick={() => setOpen(false)} disabled={saving} className={SECONDARY_BTN}>
                Cancel
              </button>
              <button type="button" onClick={() => void save()} disabled={saving} className={PRIMARY_BTN}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
