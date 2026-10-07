'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Copy, ExternalLink, Plus, Search, Star, X } from 'lucide-react';

import { api } from '../../lib/admin-api';
import { formatInr, formatOfferDate, offerDiscountLabel, offerValidityLabel } from '../../lib/offers';
import { isRichTextEmpty } from '../../lib/rich-text';
import type { Offer, OfferAvailability, OfferDiscountType } from '../../types';
import RichText from '../common/RichText';
import { ImageUpload } from './GenericModule';
import RichTextEditor from './RichTextEditor';
import { DetailsDialog, FilterMenu, RefreshButton, RowActions, SearchField, ToolbarButton } from './TableControls';
import { Field, INPUT, ImageInput, Notice, PRIMARY_BTN, SECONDARY_BTN, TextArea, TextInput, Toggle } from './planner/shared';

type TourOption = { _id: string; title: string; slug: string; isPublished?: boolean };

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  description: string;
  terms: string;
  highlights: string;
  duration: string;
  destinations: string;
  tour: string;
  image: string;
  gallery: string[];
  originalPrice: string;
  discountType: OfferDiscountType;
  discountValue: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  featured: boolean;
  sortOrder: string;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  subtitle: '',
  summary: '',
  description: '',
  terms: '',
  highlights: '',
  duration: '',
  destinations: '',
  tour: '',
  image: '',
  gallery: [],
  originalPrice: '',
  discountType: 'none',
  discountValue: '',
  startDate: '',
  endDate: '',
  status: 'active',
  featured: false,
  sortOrder: '',
  metaTitle: '',
  metaDescription: '',
};

const MAX_GALLERY = 12;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const AVAILABILITY_STYLES: Record<OfferAvailability, string> = {
  live: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  scheduled: 'bg-sky-50 text-sky-700 ring-sky-200',
  expired: 'bg-amber-50 text-amber-700 ring-amber-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const TH = 'px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]';

const toDateInput = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');

function toForm(offer: Offer): FormState {
  return {
    title: offer.title || '',
    slug: offer.slug || '',
    subtitle: offer.subtitle || '',
    summary: offer.summary || '',
    description: offer.description || '',
    terms: offer.terms || '',
    highlights: (offer.highlights || []).join('\n'),
    duration: offer.duration || '',
    destinations: (offer.destinations || []).join(', '),
    tour: offer.tour?._id || '',
    image: offer.image || '',
    gallery: offer.gallery || [],
    originalPrice: offer.originalPrice === null || offer.originalPrice === undefined ? '' : String(offer.originalPrice),
    discountType: offer.discountType || 'none',
    discountValue: offer.discountType === 'none' ? '' : String(offer.discountValue ?? ''),
    startDate: toDateInput(offer.startDate),
    endDate: toDateInput(offer.endDate),
    status: offer.status || 'active',
    featured: Boolean(offer.featured),
    sortOrder: String(offer.sortOrder ?? ''),
    metaTitle: offer.metaTitle || '',
    metaDescription: offer.metaDescription || '',
  };
}

const splitList = (value: string, separator: RegExp) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

function previewPrice(form: FormState) {
  const price = Number(form.originalPrice);
  if (form.originalPrice.trim() === '' || !Number.isFinite(price)) return null;
  const value = Number(form.discountValue) || 0;
  if (form.discountType === 'percentage') return Math.max(0, price - Math.round((price * Math.min(value, 100)) / 100));
  if (form.discountType === 'fixed') return Math.max(0, price - Math.min(value, price));
  return price;
}

function validateForm(form: FormState) {
  if (form.title.trim().length < 2) return 'Title must be at least 2 characters';
  if (form.slug.trim() && !SLUG_PATTERN.test(form.slug.trim())) {
    return 'Slug may only contain lowercase letters, numbers and hyphens';
  }

  const price = form.originalPrice.trim() === '' ? null : Number(form.originalPrice);
  if (price !== null && (!Number.isFinite(price) || price < 0)) return 'Original price must be a positive number';

  if (form.discountType !== 'none') {
    const value = Number(form.discountValue);
    if (price === null) return 'Original price is required when a discount is set';
    if (!Number.isFinite(value) || value <= 0) return 'Discount value must be greater than 0';
    if (form.discountType === 'percentage' && value > 100) return 'Percentage discount cannot exceed 100';
    if (form.discountType === 'fixed' && value > price) return 'Fixed discount cannot exceed the original price';
  }

  if (form.startDate && form.endDate && form.endDate < form.startDate) return 'End date cannot be before the start date';
  if (form.sortOrder.trim() && !Number.isInteger(Number(form.sortOrder))) return 'Sort order must be a whole number';
  return '';
}

function toPayload(form: FormState) {
  const payload: Record<string, unknown> = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle.trim(),
    summary: isRichTextEmpty(form.summary) ? '' : form.summary,
    description: isRichTextEmpty(form.description) ? '' : form.description,
    terms: isRichTextEmpty(form.terms) ? '' : form.terms,
    highlights: splitList(form.highlights, /\r?\n/),
    duration: form.duration.trim(),
    destinations: splitList(form.destinations, /,/),
    tour: form.tour,
    image: form.image.trim(),
    gallery: form.gallery.map((url) => url.trim()).filter(Boolean),
    originalPrice: form.originalPrice.trim() === '' ? '' : Number(form.originalPrice),
    discountType: form.discountType,
    discountValue: form.discountType === 'none' ? 0 : Number(form.discountValue) || 0,
    startDate: form.startDate,
    endDate: form.endDate,
    status: form.status,
    featured: form.featured,
    metaTitle: form.metaTitle.trim(),
    metaDescription: form.metaDescription.trim(),
  };
  if (form.sortOrder.trim() !== '') payload.sortOrder = Number(form.sortOrder);
  return payload;
}

function visibilityWarning(form: FormState) {
  const today = new Date().toISOString().slice(0, 10);
  if (form.status === 'inactive') return 'This offer is inactive, so it will not be shown on the website.';
  if (form.startDate && form.startDate > today) {
    return `This offer starts on ${formatOfferDate(form.startDate)}, so it stays hidden on the website until then. Clear the start date or set it to today to show it now.`;
  }
  if (form.endDate && form.endDate < today) return 'The end date has passed, so this offer will not be shown on the website.';
  return '';
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">{title}</h3>
      {description ? <p className="mt-1 text-xs text-[#64748B]">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function AvailabilityBadge({ value }: { value: OfferAvailability }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ${AVAILABILITY_STYLES[value]}`}>
      {value}
    </span>
  );
}

export default function Offers() {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [viewing, setViewing] = useState<Offer | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [tours, setTours] = useState<TourOption[] | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '200', q: q.trim() });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (availabilityFilter !== 'all') params.set('availability', availabilityFilter);
      if (featuredFilter !== 'all') params.set('featured', featuredFilter);

      const first = await api<{ data?: Offer[]; meta?: { pages?: number } }>(`/offers?${params}&page=1`);
      const all = [...(first.data || [])];
      const pages = Math.max(1, Number(first.meta?.pages) || 1);
      for (let page = 2; page <= pages; page += 1) {
        const next = await api<{ data?: Offer[] }>(`/offers?${params}&page=${page}`);
        all.push(...(next.data || []));
      }
      setItems(all);
    } catch (e: any) {
      setError(e?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, availabilityFilter, featuredFilter]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!open || tours) return;
    api<{ data?: TourOption[] }>('/tours?limit=200&sort=title')
      .then((response) => setTours(response.data || []))
      .catch(() => setTours([]));
  }, [open, tours]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setOpen(true);
  };

  const startEdit = (offer: Offer) => {
    setEditing(offer);
    setForm(toForm(offer));
    setFormError('');
    setOpen(true);
  };

  const save = async () => {
    const invalid = validateForm(form);
    if (invalid) {
      setFormError(invalid);
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const body = JSON.stringify(toPayload(form));
      if (editing) {
        await api(`/offers/${editing._id}`, { method: 'PUT', body });
      } else {
        await api('/offers', { method: 'POST', body });
      }
      setOpen(false);
      setEditing(null);
      setNotice(editing ? 'Offer updated' : 'Offer created');
      await load();
    } catch (e: any) {
      setFormError(e?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (offer: Offer) => {
    if (!confirm(`Delete "${offer.title}"? This cannot be undone.`)) return;
    try {
      await api(`/offers/${offer._id}`, { method: 'DELETE' });
      setNotice('Offer deleted');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete offer');
    }
  };

  const patchStatus = async (offer: Offer, body: { status?: Offer['status']; featured?: boolean }) => {
    setUpdating(offer._id);
    setError('');
    try {
      const response = await api<{ data?: Offer }>(`/offers/${offer._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (response.data) {
        setItems((current) => current.map((item) => (item._id === offer._id ? { ...item, ...response.data } : item)));
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to update offer');
    } finally {
      setUpdating(null);
    }
  };

  const price = useMemo(() => previewPrice(form), [form]);

  const detailRows = (offer: Offer): Array<[string, ReactNode]> => [
    ['Title', offer.title],
    ['Slug', offer.slug],
    ['Subtitle', offer.subtitle || '—'],
    ['Summary', isRichTextEmpty(offer.summary) ? '—' : <RichText key="summary" value={offer.summary} />],
    ['Status', offer.status],
    ['Availability', <AvailabilityBadge key="availability" value={offer.availability} />],
    ['Featured', offer.featured ? 'Yes' : 'No'],
    ['Sort order', String(offer.sortOrder)],
    ['Original price', formatInr(offer.originalPrice) || '—'],
    ['Discount', offerDiscountLabel(offer) || '—'],
    ['Final price', formatInr(offer.finalPrice) || '—'],
    ['Start date', formatOfferDate(offer.startDate) || '—'],
    ['End date', formatOfferDate(offer.endDate) || '—'],
    ['Duration', offer.duration || '—'],
    ['Destinations', offer.destinations?.join(', ') || '—'],
    ['Linked tour', offer.tour ? offer.tour.title : '—'],
    ['Highlights', offer.highlights?.length ? offer.highlights.join(', ') : '—'],
    ['Image', offer.image ? <img key="image" src={offer.image} alt="" className="max-h-56 rounded-xl object-contain" /> : '—'],
    [
      'Gallery images',
      offer.gallery?.length ? (
        <div key="gallery" className="flex flex-wrap gap-2">
          {offer.gallery.map((url) => (
            <img key={url} src={url} alt="" className="h-20 w-28 rounded-lg object-cover" />
          ))}
        </div>
      ) : (
        '—'
      ),
    ],
    ['Description', isRichTextEmpty(offer.description) ? '—' : <RichText key="description" value={offer.description} />],
    ['Terms', isRichTextEmpty(offer.terms) ? '—' : <RichText key="terms" value={offer.terms} />],
    ['Meta title', offer.metaTitle || '—'],
    ['Meta description', offer.metaDescription || '—'],
    ['Updated', offer.updatedAt ? new Date(offer.updatedAt).toLocaleString() : '—'],
  ];

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111827]">Offers</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage the deals shown on <span className="font-semibold">/offers</span>. Only active offers inside their date window are public.
          </p>
        </div>

        <button type="button" onClick={startNew} className={PRIMARY_BTN}>
          <Plus aria-hidden strokeWidth={2} className="h-4 w-4" />
          Add Offer
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        <SearchField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load();
          }}
          placeholder="Search title, slug or destination…"
        />
        <ToolbarButton icon={Search} label="Search" onClick={() => void load()} />
        <FilterMenu
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <FilterMenu
          label="Availability"
          value={availabilityFilter}
          onChange={setAvailabilityFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'live', label: 'Live now' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'expired', label: 'Expired' },
          ]}
        />
        <FilterMenu
          label="Featured"
          value={featuredFilter}
          onChange={setFeaturedFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'true', label: 'Featured' },
            { value: 'false', label: 'Not featured' },
          ]}
        />
        <RefreshButton onClick={() => void load()} loading={loading} />
      </div>

      {notice ? <Notice tone="success">{notice}</Notice> : null}
      {error && !open ? <Notice tone="error">{error}</Notice> : null}

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F8FAFC]">
              <th className={`${TH} w-16`}>Order</th>
              <th className={TH}>Offer</th>
              <th className={TH}>Price</th>
              <th className={TH}>Validity</th>
              <th className={TH}>Status</th>
              <th className={TH}>Featured</th>
              <th className={TH}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((offer) => {
              const busy = updating === offer._id;
              const discount = offerDiscountLabel(offer);

              return (
                <tr key={offer._id} className="border-b align-top hover:bg-[#FAFBFC]">
                  <td className="px-4 py-4 text-xs font-semibold text-[#6B7280]">{offer.sortOrder}</td>

                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      {offer.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={offer.image} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-12 w-16 shrink-0 place-items-center rounded-lg border border-dashed border-[#CBD5E1] text-[10px] text-[#94A3B8]">
                          No image
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111827]">{offer.title}</p>
                        <p className="mt-0.5 text-xs text-[#6B7280]">/offers/{offer.slug}</p>
                        {offer.destinations?.length ? (
                          <p className="mt-0.5 text-xs text-[#94A3B8]">{offer.destinations.join(' · ')}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-semibold text-[#111827]">{formatInr(offer.finalPrice) || 'On request'}</p>
                    {discount ? (
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        <span className="line-through">{formatInr(offer.originalPrice)}</span>{' '}
                        <span className="font-semibold text-[#b76b43]">{discount}</span>
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <AvailabilityBadge value={offer.availability} />
                    <p className="mt-1.5 whitespace-nowrap text-xs text-[#6B7280]">{offerValidityLabel(offer)}</p>
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patchStatus(offer, { status: offer.status === 'active' ? 'inactive' : 'active' })}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition disabled:opacity-50 ${
                        offer.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}
                    >
                      {offer.status === 'active' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      {offer.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patchStatus(offer, { featured: !offer.featured })}
                      aria-label={offer.featured ? 'Unfeature offer' : 'Feature offer'}
                      title={offer.featured ? 'Featured — click to unfeature' : 'Click to feature'}
                      className={`grid h-9 w-9 place-items-center rounded-lg border transition disabled:opacity-50 ${
                        offer.featured
                          ? 'border-amber-200 bg-amber-50 text-amber-500'
                          : 'border-[#E5E7EB] text-[#CBD5E1] hover:text-amber-400'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={offer.featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <RowActions
                      onView={() => setViewing(offer)}
                      onEdit={() => startEdit(offer)}
                      onDelete={() => remove(offer)}
                      more={[
                        { label: 'Open public page', icon: ExternalLink, href: `/offers/${offer.slug}` },
                        { label: 'Copy ID', icon: Copy, copy: offer._id },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#6B7280]">
                  {loading ? 'Loading offers…' : 'No offers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing ? (
        <DetailsDialog
          title="Offer details"
          subtitle={viewing.title}
          onClose={() => setViewing(null)}
          rows={detailRows(viewing)}
        />
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-auto rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] shadow-[0_18px_50px_rgba(17,24,39,0.16)]">
            <div className="sticky top-0 z-10 flex justify-between border-b bg-white px-7 py-5">
              <div>
                <h2 className="font-serif text-3xl">{editing ? 'Edit' : 'New'} Offer</h2>
                <p className="mt-1 text-sm text-[#6B7280]">All fields are validated again on the server before saving.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-2xl text-[#6B7280]" aria-label="Close">
                ×
              </button>
            </div>

            {formError ? (
              <div className="mx-7 mt-5">
                <Notice tone="error">{formError}</Notice>
              </div>
            ) : null}

            <div className="grid gap-5 p-7">
              <Section title="Basics">
                <Field label="Title" required wide>
                  <TextInput value={form.title} maxLength={160} onChange={(e) => set('title', e.target.value)} placeholder="Jaipur Heritage Escape" />
                </Field>
                <Field label="Slug" hint="Leave empty to generate from the title.">
                  <TextInput
                    value={form.slug}
                    maxLength={160}
                    onChange={(e) => set('slug', e.target.value.toLowerCase())}
                    placeholder="jaipur-heritage-escape"
                  />
                </Field>
                <Field label="Subtitle">
                  <TextInput value={form.subtitle} maxLength={160} onChange={(e) => set('subtitle', e.target.value)} placeholder="A short Pink City break" />
                </Field>
                <Field label="Duration">
                  <TextInput value={form.duration} maxLength={80} onChange={(e) => set('duration', e.target.value)} placeholder="3 Days / 2 Nights" />
                </Field>
                <Field label="Destinations" hint="Comma separated.">
                  <TextInput value={form.destinations} onChange={(e) => set('destinations', e.target.value)} placeholder="Jaipur, Udaipur" />
                </Field>
                <Field label="Linked tour" hint="Optional. Adds a “View & book tour” button." wide>
                  <select value={form.tour} onChange={(e) => set('tour', e.target.value)} className={INPUT}>
                    <option value="">No linked tour</option>
                    {(tours || []).map((tour) => (
                      <option key={tour._id} value={tour._id}>
                        {tour.title}
                        {tour.isPublished === false ? ' (draft)' : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Content" description="Formatted with the CKEditor toolbar: headings, colours, fonts, lists, links and more.">
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-[#111827]">Summary</span>
                  <RichTextEditor value={form.summary} onChange={(value) => set('summary', value)} placeholder="Short intro shown at the top of the offer page…" minHeight={120} />
                </div>
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-[#111827]">Description</span>
                  <RichTextEditor value={form.description} onChange={(value) => set('description', value)} placeholder="Describe the offer…" />
                </div>
                <Field label="Highlights" hint="One per line. Shown as a checklist on the offer page." wide>
                  <TextArea rows={4} value={form.highlights} onChange={(e) => set('highlights', e.target.value)} placeholder={'Heritage hotel stay\nPrivate car with driver'} />
                </Field>
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-[#111827]">Terms &amp; conditions</span>
                  <RichTextEditor value={form.terms} onChange={(value) => set('terms', value)} placeholder="Booking window, blackout dates…" minHeight={140} />
                </div>
              </Section>

              <Section title="Images" description="Uploaded to Cloudinary. The main image is used on cards and as the social preview.">
                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-[#111827]">Main image</span>
                  <ImageUpload value={form.image} onChange={(url) => set('image', url)} folder="offers" />
                </div>
                <div className="grid gap-3 sm:col-span-2">
                  <span className="block text-sm font-bold text-[#111827]">
                    Gallery <span className="font-normal text-[#6B7280]">({form.gallery.length}/{MAX_GALLERY})</span>
                  </span>
                  {form.gallery.map((url, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <ImageInput
                          value={url}
                          folder="offers"
                          onChange={(next) => set('gallery', form.gallery.map((item, i) => (i === index ? next : item)))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => set('gallery', form.gallery.filter((_, i) => i !== index))}
                        aria-label="Remove gallery image"
                        className="rounded-lg border border-red-200 p-2 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {form.gallery.length < MAX_GALLERY ? (
                    <button
                      type="button"
                      onClick={() => set('gallery', [...form.gallery, ''])}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-[#d6c3b6] px-4 py-2 text-sm text-[#b76b43]"
                    >
                      <Plus className="h-4 w-4" /> Add gallery image
                    </button>
                  ) : null}
                </div>
              </Section>

              <Section title="Pricing">
                <Field label="Original price (₹)" hint="Leave empty for “price on request”.">
                  <TextInput type="number" min={0} step="1" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="16900" />
                </Field>
                <Field label="Discount type">
                  <select
                    value={form.discountType}
                    onChange={(e) => set('discountType', e.target.value as OfferDiscountType)}
                    className={INPUT}
                  >
                    <option value="none">No discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </Field>
                {form.discountType !== 'none' ? (
                  <Field label={form.discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'} required>
                    <TextInput
                      type="number"
                      min={0}
                      max={form.discountType === 'percentage' ? 100 : undefined}
                      step="any"
                      value={form.discountValue}
                      onChange={(e) => set('discountValue', e.target.value)}
                    />
                  </Field>
                ) : null}
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm sm:col-span-2">
                  <span className="text-[#6B7280]">Customer price: </span>
                  <span className="font-bold text-[#111827]">{price === null ? 'On request' : formatInr(price)}</span>
                  {price !== null && form.discountType !== 'none' && Number(form.originalPrice) > price ? (
                    <span className="ml-2 text-[#6B7280] line-through">{formatInr(Number(form.originalPrice))}</span>
                  ) : null}
                </div>
              </Section>

              <Section title="Schedule & visibility" description="Leave dates empty for an always-on offer. The end date is inclusive.">
                <Field label="Start date">
                  <TextInput type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </Field>
                <Field label="End date">
                  <TextInput type="date" value={form.endDate} min={form.startDate || undefined} onChange={(e) => set('endDate', e.target.value)} />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => set('status', e.target.value as FormState['status'])} className={INPUT}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
                <Field label="Sort order" hint="Lower numbers show first. Empty = add to the end.">
                  <TextInput type="number" step="1" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
                </Field>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3 sm:col-span-2">
                  <span>
                    <span className="block text-sm font-bold text-[#111827]">Featured offer</span>
                    <span className="block text-xs text-[#6B7280]">Featured offers are listed first and marked on the website.</span>
                  </span>
                  <Toggle checked={form.featured} onChange={(value) => set('featured', value)} label="Featured offer" />
                </div>
                {visibilityWarning(form) ? (
                  <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 sm:col-span-2">
                    {visibilityWarning(form)}
                  </p>
                ) : null}
              </Section>

              <Section title="SEO">
                <Field label="Meta title" hint={`${form.metaTitle.length}/70`}>
                  <TextInput value={form.metaTitle} maxLength={70} onChange={(e) => set('metaTitle', e.target.value)} />
                </Field>
                <Field label="Meta description" hint={`${form.metaDescription.length}/170`}>
                  <TextArea value={form.metaDescription} maxLength={170} onChange={(e) => set('metaDescription', e.target.value)} />
                </Field>
              </Section>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-7 py-5">
              <button type="button" disabled={saving} onClick={() => setOpen(false)} className={SECONDARY_BTN}>
                Cancel
              </button>
              <button type="button" disabled={saving} onClick={save} className={PRIMARY_BTN}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create offer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
