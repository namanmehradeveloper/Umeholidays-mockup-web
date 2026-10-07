'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleHelp,
  Copy,
  Crosshair,
  Database,
  Eye,
  FileText,
  Key,
  List,
  Search,
  Link,
  MapPin,
  Plus,
  Quote,
  Route,
  Shapes,
  Sparkles,
  Star,
  Type,
  User,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { api } from '../../lib/admin-api';
import { CMS_ICONS } from '../home/cmsIcons';
import InputIcon from './InputIcon';
import RichTextEditor from './RichTextEditor';
import RichText from '../common/RichText';
import { isRichTextEmpty } from '../../lib/rich-text';
import {
  DetailsDialog,
  FilterMenu,
  RefreshButton,
  RowActions,
  SearchField,
  ToolbarButton,
} from './TableControls';

type ModuleName =
  | 'banners'
  | 'faqs'
  | 'testimonials'
  | 'moods'
  | 'seasonal'
  | 'why-reasons'
  | 'map-locations'
  | 'trip-planner-steps'
  | 'search-categories'
  | 'search-popular'
  | 'travel-essentials-services';

type ContentSource = 'destinations' | 'tours' | 'experiences';

type FieldOption = { value: string; label: string };

export type ModuleField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'url' | 'select' | 'list' | 'multiselect' | 'image';
  required?: boolean;
  placeholder?: string;
  help?: string;
  icon: LucideIcon;
  /** Overrides the key-based rich text detection for textareas. */
  rich?: boolean;
  options?: FieldOption[];
  /** Live content collection whose records populate a select/multiselect. */
  source?: ContentSource | ((data: Record<string, any>) => ContentSource | undefined);
  visible?: (data: Record<string, any>) => boolean;
};

type Config = {
  title: string;
  singular: string;
  /** Data field mirrored into the record title shown in admin lists. */
  titleKey: string;
  fields: ModuleField[];
  sample: Record<string, any>;
  image?: boolean;
  imageLabel?: string;
  validate?: (data: Record<string, any>) => string | undefined;
};

const RICH_TEXT_KEYS = ['answer', 'quote', 'description'];

const CONTENT_SOURCES: FieldOption[] = [
  { value: 'destinations', label: 'Destinations' },
  { value: 'tours', label: 'Tours' },
  { value: 'experiences', label: 'Experiences' },
];

const ICON_OPTIONS: FieldOption[] = [
  { value: '', label: 'No icon' },
  ...Object.keys(CMS_ICONS).map((key) => ({ value: key, label: key })),
];

const percent = (data: Record<string, any>, key: string, label: string) => {
  const value = data[key];
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100
    ? undefined
    : `${label} must be a number between 0 and 100`;
};

const configs: Record<ModuleName, Config> = {
  banners: {
    title: 'Banners',
    singular: 'Banner',
    titleKey: 'headline',
    image: true,
    imageLabel: 'Banner Image',
    validate: (data) => (data.image ? undefined : 'Banner image is required'),
    fields: [
      {
        key: 'headline',
        label: 'Headline',
        required: true,
        placeholder: 'Rajasthan, thoughtfully.',
        icon: Type,
      },
      {
        key: 'place',
        label: 'Place',
        placeholder: 'Jaipur',
        icon: MapPin,
      },
      {
        key: 'eyebrow',
        label: 'Eyebrow',
        placeholder: 'The Pink City',
        icon: Sparkles,
      },
      {
        key: 'line',
        label: 'Supporting Text',
        type: 'textarea',
        placeholder: 'Palaces, quiet courtyards and old streets.',
        icon: FileText,
      },
      {
        key: 'cta',
        label: 'CTA Link',
        placeholder: '/plan-your-trip',
        icon: Link,
      },
    ],
    sample: {
      headline: '',
      place: '',
      eyebrow: '',
      line: '',
      cta: '/plan-your-trip',
      image: '',
    },
  },

  faqs: {
    title: 'FAQs',
    singular: 'FAQ',
    titleKey: 'question',
    fields: [
      {
        key: 'question',
        label: 'Question',
        required: true,
        placeholder: 'What is the best time to visit Rajasthan?',
        icon: CircleHelp,
      },
      {
        key: 'answer',
        label: 'Answer',
        type: 'textarea',
        required: true,
        placeholder: 'October to March is a popular season.',
        icon: FileText,
      },
    ],
    sample: {
      question: '',
      answer: '',
    },
  },

  testimonials: {
    title: 'Testimonials',
    singular: 'Testimonial',
    titleKey: 'customer',
    image: true,
    imageLabel: 'Customer Photo (optional)',
    validate: (data) =>
      data.rating !== undefined &&
      data.rating !== '' &&
      (Number(data.rating) < 0 || Number(data.rating) > 5)
        ? 'Rating must be between 0 and 5'
        : undefined,
    fields: [
      {
        key: 'customer',
        label: 'Customer Name',
        required: true,
        placeholder: 'Aarav Mehta',
        icon: User,
      },
      {
        key: 'trip',
        label: 'Trip / Journey',
        placeholder: 'Royal Rajasthan Escape',
        icon: Route,
      },
      {
        key: 'quote',
        label: 'Review',
        type: 'textarea',
        required: true,
        placeholder: 'A wonderful journey...',
        icon: Quote,
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'number',
        placeholder: '5',
        icon: Star,
      },
    ],
    sample: {
      customer: '',
      trip: '',
      quote: '',
      rating: 5,
      avatar: '',
    },
  },

  moods: {
    title: 'Travel Moods',
    singular: 'Travel Mood',
    titleKey: 'moodTitle',
    image: true,
    imageLabel: 'Mood Image (optional)',
    fields: [
      {
        key: 'moodTitle',
        label: 'Title',
        required: true,
        icon: Type,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        icon: FileText,
      },
    ],
    sample: {
      moodTitle: '',
      description: '',
      image: '',
    },
  },

  seasonal: {
    title: 'Seasonal Recommendations',
    singular: 'Seasonal Recommendation',
    titleKey: 'seasonTitle',
    fields: [
      {
        key: 'seasonTitle',
        label: 'Title',
        required: true,
        icon: Type,
      },
      {
        key: 'season',
        label: 'Season / Date Range',
        placeholder: 'October – March',
        icon: Sparkles,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        icon: FileText,
      },
    ],
    sample: {
      seasonTitle: '',
      season: '',
      description: '',
    },
  },

  'why-reasons': {
    title: 'Why UME Reasons',
    singular: 'Reason',
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: '100% Local Expertise', icon: Type },
      { key: 'description', label: 'Description', type: 'textarea', icon: FileText },
      { key: 'icon', label: 'Icon (optional)', type: 'select', options: ICON_OPTIONS, icon: Shapes },
    ],
    sample: { title: '', description: '', icon: '' },
  },

  'map-locations': {
    title: 'Map Locations',
    singular: 'Map Location',
    titleKey: 'name',
    fields: [
      { key: 'name', label: 'Name', required: true, placeholder: 'Jaipur', icon: MapPin },
      {
        key: 'destinationId',
        label: 'Linked Destination (optional)',
        type: 'select',
        source: 'destinations',
        help: 'Pins link to the destination page while the destination is published.',
        icon: Link,
      },
      { key: 'mapX', label: 'Map X position (%)', type: 'number', required: true, placeholder: '50', help: '0 = left edge, 100 = right edge of the map.', icon: Crosshair },
      { key: 'mapY', label: 'Map Y position (%)', type: 'number', required: true, placeholder: '26', help: '0 = top edge, 100 = bottom edge of the map.', icon: Crosshair },
      { key: 'latitude', label: 'Latitude (optional)', type: 'number', icon: Crosshair },
      { key: 'longitude', label: 'Longitude (optional)', type: 'number', icon: Crosshair },
      { key: 'shortDescription', label: 'Short Description (optional)', type: 'textarea', help: 'Shown as the pin tooltip.', icon: FileText },
      { key: 'image', label: 'Image (optional)', type: 'image', icon: MapPin },
    ],
    sample: { name: '', destinationId: '', mapX: '', mapY: '', latitude: '', longitude: '', shortDescription: '', image: '' },
    validate: (data) => percent(data, 'mapX', 'Map X position') ?? percent(data, 'mapY', 'Map Y position'),
  },

  'trip-planner-steps': {
    title: 'Trip Planner Steps',
    singular: 'Planner Step',
    titleKey: 'question',
    fields: [
      { key: 'question', label: 'Question', required: true, placeholder: 'Where are you going?', icon: CircleHelp },
      {
        key: 'fieldKey',
        label: 'Answer Key',
        required: true,
        placeholder: 'destination',
        help: 'Stored with the enquiry. Use "destination" for the step that picks the destination; the planner is hidden while that step has no choices.',
        icon: Key,
      },
      {
        key: 'source',
        label: 'Choices From',
        type: 'select',
        required: true,
        options: [{ value: 'custom', label: 'Custom options' }, ...CONTENT_SOURCES],
        help: 'Destinations lists published destinations that are enabled for planning (Travel Planner → Destinations). Tours and experiences list published records.',
        icon: Database,
      },
      {
        key: 'options',
        label: 'Options',
        type: 'list',
        placeholder: 'Luxury',
        visible: (data) => data.source === 'custom',
        icon: List,
      },
      {
        key: 'optionIds',
        label: 'Limit To (optional)',
        type: 'multiselect',
        source: (data) => (data.source === 'custom' ? undefined : data.source),
        help: 'Leave empty to offer every published record. Selected records appear in the order chosen.',
        visible: (data) => Boolean(data.source) && data.source !== 'custom',
        icon: List,
      },
    ],
    sample: { question: '', fieldKey: '', source: 'custom', options: [], optionIds: [] },
    validate: (data) =>
      data.source === 'custom' && !(data.options || []).some((option: string) => String(option).trim())
        ? 'Add at least one option'
        : undefined,
  },

  'search-categories': {
    title: 'Search Categories',
    singular: 'Category',
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'Title', required: true, placeholder: 'Destinations', icon: Type },
      { key: 'description', label: 'Description', type: 'textarea', rich: false, icon: FileText },
      { key: 'url', label: 'Link', required: true, placeholder: '/destinations', icon: Link },
      { key: 'icon', label: 'Icon (optional)', type: 'select', options: ICON_OPTIONS, icon: Shapes },
    ],
    sample: { title: '', description: '', url: '', icon: '' },
  },
  'search-popular': {
    title: 'Popular Searches',
    singular: 'Popular Search',
    titleKey: 'term',
    fields: [
      {
        key: 'term',
        label: 'Search Term',
        required: true,
        placeholder: 'Jaipur',
        help: 'Shown as a chip under the search box; used when the Search Hero takes popular searches from this list.',
        icon: Search,
      },
    ],
    sample: { term: '' },
  },
  'travel-essentials-services': {
    title: 'Travel Essentials Services',
    singular: 'Service',
    titleKey: 'title',
    image: true,
    imageLabel: 'Service Image',
    validate: (data) => (data.image ? undefined : 'Service image is required'),
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', placeholder: 'Money Matters', icon: Sparkles },
      { key: 'title', label: 'Title', required: true, placeholder: 'Currency Exchange', icon: Type },
      { key: 'description', label: 'Description', type: 'textarea', rich: false, icon: FileText },
      { key: 'features', label: 'Features', type: 'list', placeholder: 'Major currencies accepted', icon: List },
    ],
    sample: { eyebrow: '', title: '', description: '', features: [], image: '' },
  },
};

const sourceOf = (field: ModuleField, data: Record<string, any>) =>
  typeof field.source === 'function' ? field.source(data) : field.source;

function useSourceOptions(sources: ContentSource[]) {
  const [options, setOptions] = useState<Partial<Record<ContentSource, FieldOption[]>>>({});
  const wanted = sources.filter((source) => !options[source]).join(',');

  useEffect(() => {
    if (!wanted) return;
    wanted.split(',').forEach(async (source) => {
      try {
        const response = await api<{ data?: any[] }>(`/${source}?limit=200`);
        const loaded = (response.data || []).map((doc) => ({
          value: String(doc._id),
          label: `${doc.name || doc.title || doc.slug}${doc.isPublished === false ? ' (draft)' : ''}`,
        }));
        setOptions((current) => ({ ...current, [source]: loaded }));
      } catch {
        setOptions((current) => ({ ...current, [source]: [] }));
      }
    });
  }, [wanted]);

  return options;
}

function StringListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const items = Array.isArray(value) ? value : [];
  const update = (index: number, text: string) => onChange(items.map((item, i) => (i === index ? text : item)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => update(index, e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#b76b43]"
          />
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="rounded-lg border px-2 disabled:opacity-30">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down" className="rounded-lg border px-2 disabled:opacity-30">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove" className="rounded-lg border border-red-200 px-2 text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-[#d6c3b6] px-4 py-2 text-sm text-[#b76b43]"
      >
        <Plus className="h-4 w-4" /> Add option
      </button>
    </div>
  );
}

function OrderedMultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: FieldOption[];
}) {
  const selected = Array.isArray(value) ? value : [];
  const labelOf = (id: string) => options.find((option) => option.value === id)?.label || id;
  const available = options.filter((option) => !selected.includes(option.value));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      {selected.map((id, index) => (
        <div key={id} className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm">
          <span className="flex-1">{labelOf(id)}</span>
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="rounded-lg border bg-white px-2 py-1 disabled:opacity-30">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label="Move down" className="rounded-lg border bg-white px-2 py-1 disabled:opacity-30">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onChange(selected.filter((item) => item !== id))} aria-label="Remove" className="rounded-lg border border-red-200 bg-white px-2 py-1 text-red-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#b76b43]"
        >
          <option value="">Add…</option>
          {available.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function ImageUpload({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (value: string) => void;
  folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    try {
      setError('');
      setUploading(true);

      const fd = new FormData();

      fd.append('image', file);
      fd.append('folder', `ume-holidays/${folder}`);

      const response = await api<{ data?: { url?: string } }>(
        '/uploads/image',
        {
          method: 'POST',
          body: fd,
        }
      );

      if (!response.data?.url) {
        throw new Error('Cloudinary did not return an image URL.');
      }

      onChange(response.data.url);
    } catch (e: any) {
      setError(e?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-4">
      {value ? (
        <img
          src={value}
          alt="Preview"
          className="mb-4 h-52 w-full rounded-xl bg-white object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="mb-4 grid h-52 place-items-center rounded-xl bg-white text-sm text-[#9CA3AF]">
          Upload your own image
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];

          e.currentTarget.value = '';

          if (file) {
            upload(file);
          }
        }}
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-xl bg-[#b76b43] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#934f30] disabled:opacity-50"
        >
          {uploading ? 'Uploading to Cloudinary…' : 'Choose Image'}
        </button>

        <button
          type="button"
          disabled={!value || uploading}
          onClick={() => onChange('')}
          className="rounded-xl border border-red-200 px-4 py-3 text-sm text-red-600 disabled:opacity-50"
        >
          Remove
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-[#6B7280]">
        JPG, PNG, WEBP or GIF · max 5MB · stored on Cloudinary.
      </p>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-[#111827] outline-none focus:border-[#b76b43]';

export function FieldControl({
  field,
  value,
  onChange,
  options,
  folder,
}: {
  field: ModuleField;
  value: any;
  onChange: (value: any) => void;
  options?: FieldOption[];
  folder: string;
}) {
  const composite = field.type === 'list' || field.type === 'multiselect' || field.type === 'image';
  const Wrapper = composite ? 'div' : 'label';

  let control;
  if (field.type === 'textarea' && (field.rich ?? RICH_TEXT_KEYS.includes(field.key))) {
    control = (
      <RichTextEditor value={value ?? ''} onChange={onChange} placeholder={field.placeholder} />
    );
  } else if (field.type === 'list') {
    control = <StringListEditor value={value} onChange={onChange} placeholder={field.placeholder} />;
  } else if (field.type === 'multiselect') {
    control = <OrderedMultiSelect value={value} onChange={onChange} options={options || []} />;
  } else if (field.type === 'image') {
    control = <ImageUpload value={value || ''} onChange={onChange} folder={folder} />;
  } else {
    control = (
      <InputIcon icon={field.icon} multiline={field.type === 'textarea'}>
        {field.type === 'textarea' ? (
          <textarea
            rows={4}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`block ${inputClass}`}
          />
        ) : field.type === 'select' ? (
          <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            {!field.options?.some((option) => option.value === '') && <option value="">—</option>}
            {(options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            step={field.type === 'number' ? 'any' : undefined}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={inputClass}
          />
        )}
      </InputIcon>
    );
  }

  return (
    <Wrapper className="block">
      <span className="mb-2 block text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {control}
      {field.help && <span className="mt-1.5 block text-xs text-[#6B7280]">{field.help}</span>}
    </Wrapper>
  );
}

export default function GenericModule({
  module,
}: {
  module: string;
}) {
  const cfg = configs[module as ModuleName];

  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [status, setStatus] = useState('active');
  const [data, setData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sourceOptions = useSourceOptions(
    open && cfg
      ? (cfg.fields.map((field) => sourceOf(field, data)).filter(Boolean) as ContentSource[])
      : []
  );

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const first = await api<{
        data?: any[];
        meta?: {
          pages?: number;
        };
      }>(
        `/admin/records/${module}?page=1&limit=200&q=${encodeURIComponent(
          q
        )}`
      );

      const pages = Math.max(
        1,
        Number(first.meta?.pages) || 1
      );

      const all = [...(first.data || [])];

      for (let page = 2; page <= pages; page += 1) {
        const next = await api<{ data?: any[] }>(
          `/admin/records/${module}?page=${page}&limit=200&q=${encodeURIComponent(
            q
          )}`
        );

        all.push(...(next.data || []));
      }

      setItems(all);
    } catch (e: any) {
      setError(
        e?.message || 'Failed to load records'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [module]);

  if (!cfg) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
        This admin module is not available.
      </div>
    );
  }

  const startNew = () => {
    setEditing(null);
    setStatus('active');
    setData({
      ...cfg.sample,
    });
    setError('');
    setOpen(true);
  };

  const startEdit = (item: any) => {
    setEditing(item);
    setStatus(item.status || 'active');

    const recordData = { ...(item.data || {}) };

    // Seeded/legacy CMS records used `data.title`; keep those records fully
    // editable after the structured form moved to module-specific title keys.
    if (module === 'moods' && !recordData.moodTitle) {
      recordData.moodTitle = recordData.title || item.title || '';
    }
    if (module === 'seasonal' && !recordData.seasonTitle) {
      recordData.seasonTitle = recordData.title || item.title || '';
    }

    setData({
      ...cfg.sample,
      ...recordData,
    });

    setError('');
    setOpen(true);
  };

  const setField = (
    key: string,
    value: any
  ) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const save = async () => {
    try {
      setError('');

      const fields = cfg.fields.filter((field) => !field.visible || field.visible(data));

      for (const field of fields) {
        if (!field.required) continue;

        const value = data[field.key];

        const empty =
          field.type === 'textarea' &&
          (field.rich ?? RICH_TEXT_KEYS.includes(field.key))
            ? isRichTextEmpty(value)
            : Array.isArray(value)
              ? !value.length
              : !String(value ?? '').trim();

        if (empty) {
          throw new Error(
            `${field.label} is required`
          );
        }
      }

      const invalid = cfg.validate?.(data);
      if (invalid) throw new Error(invalid);

      setSaving(true);

      const cleaned: Record<string, any> = { ...data };
      for (const field of cfg.fields) {
        const value = cleaned[field.key];
        if (field.type === 'number' && value !== '' && value !== undefined && value !== null) {
          cleaned[field.key] = Number(value);
        }
        if (field.type === 'list' && Array.isArray(value)) {
          cleaned[field.key] = value.map((item) => String(item).trim()).filter(Boolean);
        }
      }

      const payload = {
        title: String(
          cleaned[cfg.titleKey] || cfg.singular
        ).trim(),
        status,
        data: cleaned,
      };

      if (editing) {
        await api(
          `/admin/records/${module}/${editing._id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          }
        );
      } else {
        await api(
          `/admin/records/${module}`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        );
      }

      setOpen(false);
      setEditing(null);

      await load();
    } catch (e: any) {
      setError(
        e?.message || 'Failed to save'
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (x: any) => {
    if (!confirm('Delete record?')) {
      return;
    }

    try {
      await api(
        `/admin/records/${module}/${x._id}`,
        {
          method: 'DELETE',
        }
      );

      await load();
    } catch (e: any) {
      setError(
        e?.message || 'Failed to delete record'
      );
    }
  };

  const statuses = Array.from(
    new Set(
      items
        .map((x) => x.status)
        .filter(Boolean)
    )
  ) as string[];

  const visible = items.filter(
    (x) =>
      statusFilter === 'all' ||
      x.status === statusFilter
  );

  const toggleStatus = async (x: any) => {
    const id = String(x._id);

    try {
      setStatusUpdating(id);

      await api(
        `/admin/records/${module}/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status:
              x.status === 'active'
                ? 'inactive'
                : 'active',
          }),
        }
      );

      await load();
    } catch (e: any) {
      setError(
        e?.message ||
          'Failed to update status'
      );
    } finally {
      setStatusUpdating(null);
    }
  };

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);

    try {
      setReordering(true);
      await api(`/admin/records/${module}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ ids: next.map((item) => String(item._id)) }),
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to reorder');
      await load();
    } finally {
      setReordering(false);
    }
  };

  const canReorder = !q.trim() && statusFilter === 'all';

  const detailValue = (
    key: string,
    value: any
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return '—';
    }

    if (
      [
        'answer',
        'quote',
        'description',
      ].includes(key)
    ) {
      return (
        <RichText value={value} />
      );
    }

    if (Array.isArray(value)) {
      return value.length
        ? value.join(', ')
        : '—';
    }

    if (
      typeof value === 'object'
    ) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const detailKeys = (x: any) =>
    Object.keys(x.data || {});

  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-4">
       
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#b76b43] px-5 py-3 text-sm text-white transition-colors hover:bg-[#934f30]"
        >
          <Plus
            aria-hidden
            strokeWidth={2}
            className="h-4 w-4"
          />

          Add {cfg.singular}
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        <SearchField
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              load();
            }
          }}
          placeholder={`Search ${cfg.title.toLowerCase()}…`}
        />

        <ToolbarButton
          icon={Search}
          label="Search"
          onClick={load}
        />

        <FilterMenu
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            {
              value: 'all',
              label: 'All',
            },
            {
              value: 'active',
              label: 'Active',
            },
            {
              value: 'inactive',
              label: 'Inactive',
            },
          ]}
        />

        <RefreshButton
          onClick={load}
          loading={loading}
        />
      </div>

      {error && !open && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.04)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F8FAFC]">
              <th
                className="w-28 px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]"
                title={canReorder ? undefined : 'Clear search and filters to reorder'}
              >
                Order
              </th>

              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]">
                Title
              </th>

              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]">
                Status
              </th>

              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]">
                Updated
              </th>

              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]">
                Full Data
              </th>

              <th className="px-4 py-3 text-xs uppercase tracking-wider text-[#6B7280]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.map((x, index) => {
              const id = String(x._id);

              return (
                <tr
                  key={id}
                  className="border-b hover:bg-[#FAFBFC]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-xs font-semibold text-[#6B7280]">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={!canReorder || reordering || index === 0}
                        aria-label="Move up"
                        className="rounded-lg border border-[#E5E7EB] p-1.5 text-[#6B7280] hover:border-[#b76b43] hover:text-[#b76b43] disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={!canReorder || reordering || index === visible.length - 1}
                        aria-label="Move down"
                        className="rounded-lg border border-[#E5E7EB] p-1.5 text-[#6B7280] hover:border-[#b76b43] hover:text-[#b76b43] disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4 font-semibold text-[#111827]">
                    {x.title}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={
                        statusUpdating === id
                      }
                      onClick={() =>
                        toggleStatus(x)
                      }
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        x.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                      } disabled:opacity-50`}
                    >
                      {x.status === 'active' ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}

                      {statusUpdating === id
                        ? 'Updating…'
                        : x.status === 'active'
                          ? 'Active'
                          : 'Inactive'}
                    </button>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-[#6B7280]">
                    {x.updatedAt
                      ? new Date(
                          x.updatedAt
                        ).toLocaleString()
                      : '—'}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setViewing(x)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#D8E2F0] bg-white px-3 py-2 text-xs font-semibold text-[#b76b43] shadow-sm transition hover:border-[#ead2c3] hover:bg-[#fff8f3]"
                    >
                      <Eye className="h-4 w-4" />

                      Full View
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <RowActions
                      onEdit={() =>
                        startEdit(x)
                      }
                      onDelete={() =>
                        remove(x)
                      }
                      more={[
                        {
                          label: 'Copy ID',
                          icon: Copy,
                          copy: String(
                            x._id
                          ),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}

            {!visible.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-[#6B7280]"
                >
                  {items.length
                    ? 'No matching records.'
                    : 'No records yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <DetailsDialog
          title={`${cfg.singular} details`}
          subtitle={viewing.title}
          onClose={() =>
            setViewing(null)
          }
          rows={Object.keys(
            viewing.data || {}
          ).map((key) => [
            key,
            detailValue(
              key,
              viewing.data?.[key]
            ),
          ])}
        />
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.16)]">
            <div className="sticky top-0 z-10 flex justify-between border-b bg-white px-7 py-5">
              <div>
                <h2 className="font-serif text-3xl">
                  {editing
                    ? 'Edit'
                    : 'New'}{' '}
                  {cfg.singular}
                </h2>

                <p className="mt-1 text-sm text-[#6B7280]">
                  All content is validated before saving.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="text-2xl text-[#6B7280]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mx-7 mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 p-7">
              {cfg.fields
                .filter((field) => !field.visible || field.visible(data))
                .map((field) => {
                  const source = sourceOf(field, data);
                  return (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={data[field.key]}
                      onChange={(value) => setField(field.key, value)}
                      options={source ? sourceOptions[source] || [] : field.options}
                      folder={module}
                    />
                  );
                })}

              {cfg.image && (
                <div>
                  <span className="mb-2 block text-sm font-medium">
                    {cfg.imageLabel}
                  </span>

                  <ImageUpload
                    value={
                      data.image ||
                      data.avatar ||
                      ''
                    }
                    onChange={(
                      value
                    ) =>
                      setField(
                        module === 'testimonials' ? 'avatar' : 'image',
                        value
                      )
                    }
                    folder={module}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t bg-white px-7 py-5">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="rounded-xl bg-[#b76b43] px-6 py-3 text-white transition-colors hover:bg-[#934f30] disabled:opacity-50"
              >
                {saving
                  ? 'Saving…'
                  : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 