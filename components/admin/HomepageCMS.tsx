'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileText,
  Image as ImageIcon,
  Link,
  MousePointerClick,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Type,
  X,
} from 'lucide-react';

import { api } from '../../lib/admin-api';
import GenericModule, { FieldControl } from './GenericModule';
import type { ModuleField } from './GenericModule';
import { RefreshButton } from './TableControls';

type SectionRecord = {
  _id: string;
  title: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  data?: Record<string, any>;
  updatedAt?: string;
};

export type SectionSchema = {
  label: string;
  /** CMS tab or admin page that supplies this section's repeatable items. */
  items?: { label: string; tab?: string; href?: string };
  fields: ModuleField[];
};

export const text = (key: string, label: string, extra: Partial<ModuleField> = {}): ModuleField => ({
  key,
  label,
  icon: Type,
  ...extra,
});
export const url = (key: string, label: string): ModuleField => ({ key, label, icon: Link, placeholder: '/tours' });
const image = (key: string, label: string): ModuleField => ({ key, label, type: 'image', icon: ImageIcon });
export const plainText = (key: string, label: string): ModuleField => ({
  key,
  label,
  type: 'textarea',
  rich: false,
  icon: FileText,
});

const headingFields: ModuleField[] = [
  text('eyebrow', 'Eyebrow', { icon: Sparkles }),
  text('title', 'Heading'),
  plainText('description', 'Subtitle / Description'),
];

const ctaFields: ModuleField[] = [
  text('ctaLabel', 'CTA Label', { icon: MousePointerClick }),
  url('ctaUrl', 'CTA Link'),
];

const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    label: 'Hero Banner',
    items: { label: 'Hero Banners', tab: 'banners' },
    fields: [
      text('title', 'Carousel accessible label', { help: 'Read by screen readers; not shown visually.' }),
      text('topLabel', 'Top Label', { icon: Sparkles }),
      text('brandLabel', 'Brand Label', { icon: Sparkles }),
      text('primaryCtaLabel', 'Primary CTA Label', { icon: MousePointerClick }),
      url('primaryCtaUrl', 'Primary CTA Link'),
      text('secondaryCtaLabel', 'Secondary CTA Label', {
        icon: MousePointerClick,
        help: 'Links to the CTA link of the current banner slide.',
      }),
      text('slideCountLabel', 'Slide Count Suffix', { placeholder: 'places' }),
    ],
  },
  'trip-planner': {
    label: 'Trip Planner',
    items: { label: 'Planner Steps', tab: 'trip-planner-steps' },
    fields: [
      text('eyebrow', 'Eyebrow', { icon: Sparkles }),
      text('contactStepTitle', 'Contact Step Heading'),
      text('namePlaceholder', 'Name Placeholder'),
      text('emailPlaceholder', 'Email Placeholder'),
      text('phonePlaceholder', 'Phone Placeholder'),
      text('backLabel', 'Back Button Label'),
      text('submitLabel', 'Submit Button Label', { required: true, icon: MousePointerClick }),
      text('submittingLabel', 'Submitting Label'),
      text('validationMessage', 'Validation Message'),
      text('successEyebrow', 'Success Eyebrow', { icon: Sparkles }),
      text('successTitle', 'Success Heading'),
      plainText('successMessage', 'Success Message'),
      text('resetLabel', 'Reset Button Label'),
    ],
  },
  destinations: {
    label: 'Destinations',
    items: { label: 'Destinations', href: '/admin/destinations' },
    fields: headingFields,
  },
  story: {
    label: 'Story / About',
    fields: [
      text('eyebrow', 'Eyebrow', { icon: Sparkles }),
      text('title', 'Heading'),
      text('highlightedTitle', 'Highlighted Heading Part', { help: 'Shown after the heading in the accent colour.' }),
      plainText('description', 'Description'),
      plainText('secondaryText', 'Secondary Text'),
      image('image', 'Image'),
      text('imageAlt', 'Image Alt Text'),
      text('imageBadge', 'Image Badge'),
      text('buttonLabel', 'Button Label', { icon: MousePointerClick }),
      url('buttonUrl', 'Button Link'),
    ],
  },
  moods: {
    label: 'Travel Moods',
    items: { label: 'Travel Moods', tab: 'moods' },
    fields: [...headingFields, text('itemLabel', 'Card Label', { placeholder: 'Travel mood' })],
  },
  tours: {
    label: 'Signature Journeys',
    items: { label: 'Tours', href: '/admin/tours' },
    fields: [...headingFields, ...ctaFields, text('priceLabel', 'Price Prefix', { placeholder: 'From' })],
  },
  experiences: {
    label: 'Experiences',
    items: { label: 'Experiences', href: '/admin/experiences' },
    fields: headingFields,
  },
  map: {
    label: 'Route Map',
    items: { label: 'Map Locations', tab: 'map-locations' },
    fields: [...headingFields, ...ctaFields, text('mapLabel', 'Map Caption'), image('mapImage', 'Map Image (optional)')],
  },
  why: {
    label: 'Why UME',
    items: { label: 'Reasons', tab: 'why-reasons' },
    fields: headingFields,
  },
  seasonal: {
    label: 'Seasonal Guide',
    items: { label: 'Seasonal', tab: 'seasonal' },
    fields: headingFields,
  },
  testimonials: {
    label: 'Testimonials',
    items: { label: 'Testimonials', tab: 'testimonials' },
    fields: headingFields,
  },
  journal: {
    label: 'Journal',
    items: { label: 'Stories', href: '/admin/stories' },
    fields: [...headingFields, ...ctaFields],
  },
  faqs: {
    label: 'FAQs',
    items: { label: 'FAQs', tab: 'faqs' },
    fields: headingFields,
  },
  'final-cta': {
    label: 'Final CTA',
    fields: [
      ...headingFields,
      image('backgroundImage', 'Background Image (optional)'),
      text('primaryButtonLabel', 'Primary Button Label', { icon: MousePointerClick }),
      url('primaryButtonUrl', 'Primary Button Link'),
      text('secondaryButtonLabel', 'Secondary Button Label', { icon: MousePointerClick }),
      url('secondaryButtonUrl', 'Secondary Button Link'),
    ],
  },
};

const HOME_TABS: Array<{ id: string; label: string }> = [
  { id: 'banners', label: 'Hero Banners' },
  { id: 'trip-planner-steps', label: 'Planner Steps' },
  { id: 'moods', label: 'Travel Moods' },
  { id: 'map-locations', label: 'Map Locations' },
  { id: 'why-reasons', label: 'Why Reasons' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faqs', label: 'FAQs' },
];

function SectionEditor({
  module,
  schemas,
  sectionKey,
  record,
  onClose,
  onSaved,
}: {
  module: string;
  schemas: Record<string, SectionSchema>;
  sectionKey: string;
  record?: SectionRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const schema = schemas[sectionKey];
  const [data, setData] = useState<Record<string, any>>({ ...(record?.data || {}) });
  const [status, setStatus] = useState<'active' | 'inactive'>(record?.status || 'active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    try {
      setError('');
      for (const field of schema.fields) {
        if (field.required && !String(data[field.key] ?? '').trim()) {
          throw new Error(`${field.label} is required`);
        }
      }
      setSaving(true);

      const cleaned = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
      );
      const payload = {
        title: schema.label,
        status,
        data: { ...cleaned, key: sectionKey },
      };

      if (record) {
        await api(`/admin/records/${module}/${record._id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api(`/admin/records/${module}`, { method: 'POST', body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (e: any) {
      setError(e?.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.16)]">
        <div className="sticky top-0 z-10 flex justify-between border-b bg-white px-7 py-5">
          <div>
            <h2 className="font-serif text-3xl">{schema.label}</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Empty fields are hidden on the website.</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-[#6B7280]" aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="mx-7 mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-5 p-7">
          <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <span className="text-sm font-medium">Show this section on the website</span>
            <input
              type="checkbox"
              checked={status === 'active'}
              onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
              className="h-5 w-5 accent-[#b76b43]"
            />
          </label>

          {schema.fields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={data[field.key]}
              onChange={(value) => setData((current) => ({ ...current, [field.key]: value }))}
              options={field.options}
              folder={module}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t bg-white px-7 py-5">
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border px-5 py-3">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-xl bg-[#b76b43] px-6 py-3 text-white transition-colors hover:bg-[#934f30] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionsManager({
  module,
  schemas,
  pageName,
  onOpenTab,
}: {
  module: string;
  schemas: Record<string, SectionSchema>;
  pageName: string;
  onOpenTab: (tab: string) => void;
}) {
  const [records, setRecords] = useState<SectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ key: string; record?: SectionRecord } | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api<{ data?: SectionRecord[] }>(`/admin/records/${module}?limit=200`);
      setRecords((response.data || []).filter((record) => schemas[record.data?.key]));
    } catch (e: any) {
      setError(e?.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (action: () => Promise<unknown>) => {
    try {
      setBusy(true);
      setError('');
      await action();
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setBusy(false);
      await load();
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= records.length) return;
    const next = [...records];
    [next[index], next[target]] = [next[target], next[index]];
    setRecords(next);
    run(() =>
      api(`/admin/records/${module}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ ids: next.map((record) => record._id) }),
      }),
    );
  };

  const toggle = (record: SectionRecord) =>
    run(() =>
      api(`/admin/records/${module}/${record._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: record.status === 'active' ? 'inactive' : 'active' }),
      }),
    );

  const remove = (record: SectionRecord) => {
    if (!confirm(`Delete the "${schemas[record.data!.key].label}" section? It will disappear from the ${pageName}.`)) return;
    run(() => api(`/admin/records/${module}/${record._id}`, { method: 'DELETE' }));
  };

  const existingKeys = new Set(records.map((record) => record.data?.key));
  const missing = Object.keys(schemas).filter((key) => !existingKeys.has(key));

  const itemsLink = (key: string) => {
    const items = schemas[key].items;
    if (!items) return <span className="text-[#9CA3AF]">—</span>;
    return items.tab ? (
      <button type="button" onClick={() => onOpenTab(items.tab!)} className="text-[#b76b43] hover:underline">
        {items.label}
      </button>
    ) : (
      <a href={items.href} className="text-[#b76b43] hover:underline">
        {items.label}
      </a>
    );
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[#6B7280]">
          Sections render on the {pageName} in this order. Inactive or deleted sections, and sections without any
          active items, are not shown.
        </p>
        <RefreshButton onClick={load} loading={loading} />
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#6B7280]">
              <th className="w-28 px-4 py-3">Order</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Heading</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const key = record.data!.key as string;
              return (
                <tr key={record._id} className="border-b hover:bg-[#FAFBFC]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-xs font-semibold text-[#6B7280]">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={busy || index === 0}
                        aria-label="Move up"
                        className="rounded-lg border border-[#E5E7EB] p-1.5 text-[#6B7280] hover:border-[#b76b43] hover:text-[#b76b43] disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={busy || index === records.length - 1}
                        aria-label="Move down"
                        className="rounded-lg border border-[#E5E7EB] p-1.5 text-[#6B7280] hover:border-[#b76b43] hover:text-[#b76b43] disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#111827]">{schemas[key].label}</td>
                  <td className="max-w-[320px] truncate px-4 py-4 text-[#4B5563]">
                    {record.data?.title || record.data?.eyebrow || record.data?.placeholder || '—'}
                  </td>
                  <td className="px-4 py-4">{itemsLink(key)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggle(record)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        record.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                      } disabled:opacity-50`}
                    >
                      {record.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {record.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing({ key, record })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#374151] hover:border-[#b76b43] hover:text-[#b76b43]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => remove(record)}
                        aria-label="Delete section"
                        className="rounded-lg border border-red-200 px-2.5 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!records.length && !loading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#6B7280]">
                  No sections yet — the {pageName} is empty until a section is added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {missing.length > 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-5">
          <p className="text-sm font-medium text-[#111827]">Not on the {pageName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setEditing({ key })}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d6c3b6] bg-white px-3 py-1.5 text-xs font-semibold text-[#b76b43] hover:bg-[#fff8f3]"
              >
                <Plus className="h-3.5 w-3.5" /> {schemas[key].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <SectionEditor
          module={module}
          schemas={schemas}
          sectionKey={editing.key}
          record={editing.record}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/** Admin for one website page: its keyed sections plus tabs for the CMS modules that feed them. */
export function PageCMS({
  title,
  pageName,
  module,
  schemas,
  tabs,
}: {
  title: string;
  pageName: string;
  module: string;
  schemas: Record<string, SectionSchema>;
  tabs: Array<{ id: string; label: string }>;
}) {
  const [tab, setTab] = useState('sections');
  const allTabs = [{ id: 'sections', label: 'Sections' }, ...tabs];

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#6B7280]">Website</p>
      <h1 className="mt-2 font-serif text-4xl text-[#111827]">{title}</h1>

      <div className="mb-7 mt-6 flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
        {allTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === item.id ? 'bg-[#b76b43] text-white' : 'text-[#4B5563] hover:bg-[#F3F4F6]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'sections' ? (
        <SectionsManager module={module} schemas={schemas} pageName={pageName} onOpenTab={setTab} />
      ) : (
        <GenericModule key={tab} module={tab} />
      )}
    </div>
  );
}

export default function HomepageCMS() {
  return (
    <PageCMS title="Homepage" pageName="homepage" module="home-sections" schemas={SECTION_SCHEMAS} tabs={HOME_TABS} />
  );
}
