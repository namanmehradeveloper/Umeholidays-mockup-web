'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { api } from '../../../lib/admin-api';
import { Card, Field, ImageInput, Notice, PRIMARY_BTN, SECONDARY_BTN, TextArea, TextInput, Toggle, inr } from './shared';

type Settings = Record<string, any>;
type TextField = [key: string, label: string, multiline?: boolean];

const COPY_SECTIONS: Array<{ key: string; title: string; description: string; fields: TextField[] }> = [
  {
    key: 'builder',
    title: 'Planner header',
    description: 'Shown at the top of the planner card.',
    fields: [
      ['eyebrow', 'Eyebrow'],
      ['title', 'Title'],
    ],
  },
  {
    key: 'summary',
    title: 'Live summary panel',
    description: 'The sticky “Your journey” sidebar.',
    fields: [
      ['eyebrow', 'Eyebrow'],
      ['title', 'Title'],
      ['notSelectedLabel', 'Not selected label'],
      ['estimateLabel', 'Estimate label'],
      ['estimatePendingLabel', 'Estimate placeholder'],
      ['adultsLabel', 'Adults label'],
      ['childrenLabel', 'Children label'],
    ],
  },
  {
    key: 'labels',
    title: 'Buttons, form & system messages',
    description: '“Request label” is the button that opens the final details form.',
    fields: [
      ['back', 'Back button'],
      ['continue', 'Continue button'],
      ['request', 'Request label'],
      ['submit', 'Submit button'],
      ['sending', 'Sending label'],
      ['retry', 'Retry button'],
      ['loading', 'Loading label'],
      ['loadError', 'Load error message', true],
      ['unavailable', 'Unavailable message', true],
      ['name', 'Name placeholder'],
      ['email', 'Email placeholder'],
      ['phone', 'Phone placeholder'],
      ['message', 'Message placeholder'],
      ['contactRequired', 'Missing contact details message', true],
      ['invalidEmail', 'Invalid email message', true],
    ],
  },
  {
    key: 'success',
    title: 'Success screen',
    description: 'Shown after the journey request is saved.',
    fields: [
      ['eyebrow', 'Eyebrow'],
      ['title', 'Title'],
      ['description', 'Description', true],
      ['resetLabel', 'Reset button'],
    ],
  },
];

const PAGE_FIELDS: TextField[] = [
  ['heroEyebrow', 'Hero eyebrow'],
  ['heroTitle', 'Hero title'],
  ['heroTitleMuted', 'Hero title (muted line)'],
  ['heroDescription', 'Hero description', true],
  ['howItWorksEyebrow', '“How it works” eyebrow'],
  ['howItWorksTitle', '“How it works” title'],
  ['howItWorksDescription', '“How it works” description', true],
  ['destinationLinkLabel', 'Destination card link prefix'],
  ['finalEyebrow', 'Closing eyebrow'],
  ['finalTitle', 'Closing title'],
  ['finalCtaLabel', 'Closing button label'],
  ['finalCtaHref', 'Closing button link'],
];

const STEP_NAMES: Record<string, string> = {
  destination: 'Destination',
  duration: 'Duration',
  'travel-style': 'Travel style',
  hotel: 'Hotel',
  transport: 'Transport',
  activities: 'Activities (optional)',
  travellers: 'Travellers',
  details: 'Contact details',
};

function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api<{ data?: Settings }>('/planner/admin/settings');
      setSettings(response.data || null);
    } catch (e: any) {
      setError(e.message || 'Failed to load planner settings');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (sections: string[]) => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const body = Object.fromEntries(sections.map((section) => [section, settings[section]]));
      const response = await api<{ data?: Settings }>('/planner/admin/settings', { method: 'PATCH', body: JSON.stringify(body) });
      setSettings(response.data || settings);
      setNotice('Saved. The planner uses the new values immediately.');
    } catch (e: any) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (section: string, key: string, value: unknown) =>
    setSettings((current) => (current ? { ...current, [section]: { ...current[section], [key]: value } } : current));

  return { settings, setSettings, error, notice, saving, save, update };
}

export function PlannerSettingsAdmin() {
  const { settings, setSettings, error, notice, saving, save, update } = useSettings();

  if (!settings) return error ? <Notice tone="error">{error}</Notice> : <p className="text-sm text-[#64748B]">Loading…</p>;

  const updateStep = (key: string, field: string, value: unknown) =>
    setSettings({ ...settings, steps: settings.steps.map((step: any) => (step.key === key ? { ...step, [field]: value } : step)) });

  const howItWorks: Array<{ title: string; text: string }> = settings.page.howItWorks || [];
  const setHowItWorks = (rows: Array<{ title: string; text: string }>) => update('page', 'howItWorks', rows);

  return (
    <div className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      <Card title="Planner steps" description="Heading, instructions, sidebar label and empty-state message for every step. Only the activities step can be switched off; the others are required for pricing.">
        <div className="space-y-4">
          {settings.steps.map((step: any) => (
            <div key={step.key} className="rounded-xl border border-[#EEF2F6] bg-[#FBFCFE] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#0F172A]">{STEP_NAMES[step.key] || step.key}</p>
                {step.key === 'activities' ? (
                  <span className="flex items-center gap-2 text-xs text-[#64748B]">
                    {step.status === 'active' ? 'Shown' : 'Hidden'}
                    <Toggle checked={step.status === 'active'} onChange={(on) => updateStep(step.key, 'status', on ? 'active' : 'inactive')} label="Show activities step" />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Required</span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Eyebrow">
                  <TextInput value={step.eyebrow || ''} maxLength={80} onChange={(e) => updateStep(step.key, 'eyebrow', e.target.value)} />
                </Field>
                <Field label="Sidebar label">
                  <TextInput value={step.summaryLabel || ''} maxLength={60} onChange={(e) => updateStep(step.key, 'summaryLabel', e.target.value)} />
                </Field>
                <Field label="Title" wide>
                  <TextInput value={step.title || ''} maxLength={160} onChange={(e) => updateStep(step.key, 'title', e.target.value)} />
                </Field>
                <Field label="Description" wide>
                  <TextArea rows={2} value={step.description || ''} maxLength={600} onChange={(e) => updateStep(step.key, 'description', e.target.value)} />
                </Field>
                {!['travellers', 'details'].includes(step.key) ? (
                  <Field label="Empty / unavailable message" wide>
                    <TextArea rows={2} value={step.emptyMessage || ''} maxLength={400} onChange={(e) => updateStep(step.key, 'emptyMessage', e.target.value)} />
                  </Field>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" disabled={saving} onClick={() => void save(['steps'])} className={PRIMARY_BTN}>
            {saving ? 'Saving…' : 'Save steps'}
          </button>
        </div>
      </Card>

      {COPY_SECTIONS.map((section) => (
        <Card key={section.key} title={section.title} description={section.description}>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.fields.map(([key, label, multiline]) => (
              <Field key={key} label={label} wide={multiline}>
                {multiline ? (
                  <TextArea rows={2} value={settings[section.key]?.[key] || ''} onChange={(e) => update(section.key, key, e.target.value)} />
                ) : (
                  <TextInput value={settings[section.key]?.[key] || ''} onChange={(e) => update(section.key, key, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" disabled={saving} onClick={() => void save([section.key])} className={PRIMARY_BTN}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Card>
      ))}

      <Card title="Plan Your Trip page" description="Hero, “How it works”, destination strip and closing call-to-action around the planner.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Hero image" wide>
            <ImageInput value={settings.page.heroImage || ''} onChange={(url) => update('page', 'heroImage', url)} folder="planner" />
          </Field>
          {PAGE_FIELDS.map(([key, label, multiline]) => (
            <Field key={key} label={label} wide={multiline}>
              {multiline ? (
                <TextArea rows={2} value={settings.page[key] || ''} onChange={(e) => update('page', key, e.target.value)} />
              ) : (
                <TextInput value={settings.page[key] || ''} onChange={(e) => update('page', key, e.target.value)} />
              )}
            </Field>
          ))}
          <Field label="Trust points" hint="One per line." wide>
            <TextArea
              rows={3}
              value={(settings.page.trustPoints || []).join('\n')}
              onChange={(e) => update('page', 'trustPoints', e.target.value.split('\n'))}
            />
          </Field>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-bold text-[#111827]">“How it works” steps</p>
            <div className="space-y-2">
              {howItWorks.map((row, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-[#EEF2F6] p-3 sm:flex-row">
                  <TextInput
                    placeholder="Title"
                    value={row.title || ''}
                    onChange={(e) => setHowItWorks(howItWorks.map((r, i) => (i === index ? { ...r, title: e.target.value } : r)))}
                    className="sm:w-1/3"
                  />
                  <TextInput
                    placeholder="Text"
                    value={row.text || ''}
                    onChange={(e) => setHowItWorks(howItWorks.map((r, i) => (i === index ? { ...r, text: e.target.value } : r)))}
                  />
                  <button type="button" aria-label="Remove step" onClick={() => setHowItWorks(howItWorks.filter((_, i) => i !== index))} className={`${SECONDARY_BTN} text-red-600`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setHowItWorks([...howItWorks, { title: '', text: '' }])} className={`${SECONDARY_BTN} mt-2`}>
              <Plus size={14} /> Add step
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#EEF2F6] p-3">
            <span className="text-sm font-bold">Show planner destinations strip</span>
            <Toggle checked={Boolean(settings.page.showDestinations)} onChange={(on) => update('page', 'showDestinations', on)} label="Show destinations strip" />
          </div>
          <Field label="Destinations in strip">
            <TextInput type="number" min={0} max={12} value={settings.page.destinationsLimit ?? 3} onChange={(e) => update('page', 'destinationsLimit', Number(e.target.value))} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" disabled={saving} onClick={() => void save(['page'])} className={PRIMARY_BTN}>
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </Card>
    </div>
  );
}

const PREVIEW_SOURCES = [
  ['destinationId', 'Destination', '/planner/destinations'],
  ['durationId', 'Duration', '/planner/options/durations'],
  ['travelStyleId', 'Travel style', '/planner/options/travel-styles'],
  ['hotelId', 'Hotel', '/planner/options/hotels'],
  ['transportId', 'Transport', '/planner/options/transports'],
] as const;

function QuotePreview({ refreshKey }: { refreshKey: number }) {
  const [lists, setLists] = useState<Record<string, any[]>>({});
  const [selection, setSelection] = useState<Record<string, any>>({ adults: 2, children: 0 });
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all(PREVIEW_SOURCES.map(([, , url]) => api<{ data?: any[] }>(url).then((r) => r.data || [])))
      .then((results) => {
        const next = Object.fromEntries(PREVIEW_SOURCES.map(([key], i) => [key, results[i]]));
        setLists(next);
        setSelection((current) => {
          const filled = { ...current };
          for (const [key] of PREVIEW_SOURCES) if (!filled[key] && next[key][0]) filled[key] = next[key][0].id;
          return filled;
        });
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (PREVIEW_SOURCES.some(([key]) => !selection[key])) return;
    setError('');
    api<{ data?: any }>('/planner/calculate', { method: 'POST', body: JSON.stringify({ ...selection, activityIds: [] }) })
      .then((r) => setQuote(r.data))
      .catch((e) => {
        setQuote(null);
        setError(e.message);
      });
  }, [selection, refreshKey]);

  const rows: Array<[string, unknown]> = quote
    ? [
        ['Destination base', quote.destination],
        ['Hotel', quote.hotel],
        ['Transport', quote.transport],
        ['Activities', quote.activities],
        ['Subtotal', quote.subtotal],
        [`Style & duration modifiers (${quote.modifierPercent}%)`, quote.adjustments],
        [`Taxes (${quote.taxPercent}%)`, quote.taxes],
      ]
    : [];

  return (
    <Card title="Quote preview" description="Runs the same POST /api/planner/calculate the public planner uses. Saved changes are reflected immediately.">
      <div className="grid gap-3 sm:grid-cols-3">
        {PREVIEW_SOURCES.map(([key, label]) => (
          <Field key={key} label={label}>
            <select value={selection[key] || ''} onChange={(e) => setSelection({ ...selection, [key]: e.target.value })} className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm">
              {!lists[key]?.length ? <option value="">None available</option> : null}
              {(lists[key] || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
        ))}
        <Field label="Adults">
          <TextInput type="number" min={1} value={selection.adults} onChange={(e) => setSelection({ ...selection, adults: Number(e.target.value) })} />
        </Field>
        <Field label="Children">
          <TextInput type="number" min={0} value={selection.children} onChange={(e) => setSelection({ ...selection, children: Number(e.target.value) })} />
        </Field>
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {quote ? (
        <div className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-1 text-[#334155]">
              <span>{label}</span>
              <span>{inr(value)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold text-[#0F172A]">
            <span>Estimated total</span>
            <span>{inr(quote.estimatedTotal)}</span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

const PRICING_FIELDS: Array<[section: 'pricing' | 'limits', key: string, label: string, hint: string, min: number, max: number, step?: number]> = [
  ['pricing', 'childRate', 'Child rate', 'Fraction of the adult price charged per child for per-person costs (0–1).', 0, 1, 0.05],
  ['pricing', 'guestsPerRoom', 'Guests per room', 'Rooms = travellers ÷ this, rounded up. Hotel cost = price per night × nights × rooms.', 1, 6],
  ['pricing', 'taxPercent', 'Tax (%)', 'Added after style/duration modifiers.', 0, 50, 0.5],
  ['pricing', 'roundTo', 'Round estimate up to', 'e.g. 100 rounds ₹70,350 up to ₹70,400.', 1, 10000],
  ['limits', 'maxAdults', 'Max adults', 'Upper limit enforced by the planner and the backend.', 1, 50],
  ['limits', 'maxChildren', 'Max children', 'Set 0 to hide the children input.', 0, 50],
];

export function PlannerPricingAdmin() {
  const { settings, error, notice, saving, save, update } = useSettings();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!settings) return error ? <Notice tone="error">{error}</Notice> : <p className="text-sm text-[#64748B]">Loading…</p>;

  return (
    <div className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      <Card
        title="Pricing rules"
        description="Estimate = (destination base × days × paying travellers + hotel + transport + activities) × (1 + style % + duration %) × (1 + tax %), rounded up. Option prices are edited on their own tabs; destination base prices on the Destinations tab."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" hint="ISO code, e.g. INR.">
            <TextInput value={settings.pricing.currency || ''} maxLength={3} onChange={(e) => update('pricing', 'currency', e.target.value.toUpperCase())} />
          </Field>
          {PRICING_FIELDS.map(([section, key, label, hint, min, max, step]) => (
            <Field key={key} label={label} hint={hint}>
              <TextInput type="number" min={min} max={max} step={step} value={settings[section]?.[key] ?? ''} onChange={(e) => update(section, key, Number(e.target.value))} />
            </Field>
          ))}
          <Field label="Disclaimer" hint="Shown under every estimate." wide>
            <TextArea rows={2} value={settings.pricing.disclaimer || ''} maxLength={400} onChange={(e) => update('pricing', 'disclaimer', e.target.value)} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              await save(['pricing', 'limits']);
              setRefreshKey((value) => value + 1);
            }}
            className={PRIMARY_BTN}
          >
            {saving ? 'Saving…' : 'Save pricing'}
          </button>
        </div>
      </Card>

      <QuotePreview refreshKey={refreshKey} />
    </div>
  );
}
