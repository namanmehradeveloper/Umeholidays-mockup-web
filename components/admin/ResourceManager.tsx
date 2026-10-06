'use client';

import { useEffect, useRef, useState } from 'react';

import type {
  InputHTMLAttributes,
  ReactNode,
  RefObject,
  TextareaHTMLAttributes,
} from 'react';

import {
  Calendar,
  CalendarRange,
  Car,
  Check,
  Clock,
  Copy,
  Eye,
  FileText,
  Gauge,
  Heart,
  Hotel,
  IndianRupee,
  Link2,
  List,
  Map as MapIcon,
  MapPin,
  Plus,
  Route,
  Search,
  Sparkles,
  Star,
  Tag,
  Type,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { api } from '../../lib/admin-api';

import InputIcon from './InputIcon';

import RichTextEditor from './RichTextEditor';

import RichText from '../common/RichText';

import {
  isRichTextEmpty,
  sanitizeRichText,
} from '../../lib/rich-text';

import {
  DetailsDialog,
  FilterMenu,
  RefreshButton,
  RowActions,
  SearchField,
  ToolbarButton,
} from './TableControls';

import type { MoreItem } from './TableControls';


type ResourceType =
  | 'destinations'
  | 'tours'
  | 'experiences'
  | 'events'
  | 'stories';


type FormState = {
  name?: string;
  region?: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
  bestTime?: string;
  recommendedDays?: string;
  highlights?: string;
  experiences?: string;
  food?: string;
  tips?: string;
  plannerEnabled?: boolean;
  plannerBasePrice?: string;
  plannerSortOrder?: string;

  title?: string;
  eyebrow?: string;
  duration?: string;
  price?: string;
  totalSeats?: string;
  availableSeats?: string;
  destinations?: string;
  category?: string;
  rating?: string;
  hotel?: string;
  transport?: string;
  difficulty?: string;
  ideal?: string;

  image?: string;
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;

  author?: string;
  reading?: string;
  excerpt?: string;
  content?: string;
  itinerary?: string;

  isPublished: boolean;
  featured: boolean;

  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex: boolean;
};


const CONFIGS: Record<
  ResourceType,
  {
    title: string;
    endpoint: string;
    columns: string[];
  }
> = {
  destinations: {
    title: 'Destinations',
    endpoint: '/destinations',
    columns: [
      'name',
      'region',
      'isPublished',
      'featured',
      'planner',
      'seo',
    ],
  },

  tours: {
    title: 'Tours',
    endpoint: '/tours',
    columns: [
      'title',
      'duration',
      'price',
      'availableSeats',
      'category',
      'isPublished',
      'seo',
    ],
  },

  experiences: {
    title: 'Experiences',
    endpoint: '/experiences',
    columns: [
      'title',
      'location',
      'duration',
      'category',
      'isPublished',
      'seo',
    ],
  },

  events: {
    title: 'Events',
    endpoint: '/events',
    columns: [
      'title',
      'location',
      'category',
      'startDate',
      'isPublished',
      'seo',
    ],
  },

  stories: {
    title: 'Stories',
    endpoint: '/stories',
    columns: [
      'title',
      'category',
      'author',
      'isPublished',
      'featured',
      'seo',
    ],
  },
};


const emptyForm: FormState = {
  isPublished: true,
  featured: false,
  noIndex: false,
};


function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#111827]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}


function Input({
  icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
}) {
  const input = (
    <input
      {...props}
      className={`
        w-full
        rounded-xl
        border
        border-[#E5E7EB]
        bg-white
        py-3
        pr-4
        ${icon ? 'pl-10' : 'pl-4'}
        text-[#111827]
        outline-none
        transition
        focus:border-[#b76b43]
        focus:ring-2
        focus:ring-[#b76b43]/10
        ${className || ''}
      `}
    />
  );

  return icon ? (
    <InputIcon icon={icon}>
      {input}
    </InputIcon>
  ) : (
    input
  );
}


function Textarea({
  icon,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon?: LucideIcon;
}) {
  const textarea = (
    <textarea
      {...props}
      className={`
        block
        w-full
        resize-y
        rounded-xl
        border
        border-[#E5E7EB]
        bg-white
        py-3
        pr-4
        ${icon ? 'pl-10' : 'pl-4'}
        text-[#111827]
        outline-none
        transition
        focus:border-[#b76b43]
        focus:ring-2
        focus:ring-[#b76b43]/10
        ${className || ''}
      `}
    />
  );

  return icon ? (
    <InputIcon
      icon={icon}
      multiline
    >
      {textarea}
    </InputIcon>
  ) : (
    textarea
  );
}


function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="
      flex
      cursor-pointer
      items-center
      justify-between
      rounded-xl
      border
      border-[#E5E7EB]
      bg-white
      p-4
    ">
      <span className="text-sm font-bold text-[#111827]">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative
          h-7
          w-12
          rounded-full
          transition
          ${
            checked
              ? 'bg-emerald-500'
              : 'bg-[#E5E7EB]'
          }
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-5
            w-5
            rounded-full
            bg-white
            shadow
            transition
            ${
              checked
                ? 'left-6'
                : 'left-1'
            }
          `}
        />
      </button>
    </label>
  );
}


function toDateInput(value?: string) {
  if (!value) return '';

  const d = new Date(value);

  return Number.isNaN(d.getTime())
    ? ''
    : d.toISOString().slice(0, 10);
}


function listToText(value: unknown) {
  return Array.isArray(value)
    ? value.join('\n')
    : String(value || '');
}


function listToHtml(value: unknown) {
  if (!Array.isArray(value)) {
    return String(value || '');
  }

  return value
    .map((item) => {
      const text = String(item ?? '');

      if (
        /<(?:p|h2|h3|h4|strong|em|ul|ol|blockquote|br\b|hr\b|pre|figure|table|span|u>|s>|code)/i.test(
          text
        )
      ) {
        return sanitizeRichText(text);
      }

      return `<p>${text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</p>`;
    })
    .join('');
}


function toForm(
  type: ResourceType,
  record?: any
): FormState {
  if (!record) {
    if (type === 'destinations') {
      return {
        ...emptyForm,
        region: 'Rajasthan',
      };
    }

    if (type === 'stories') {
      return {
        ...emptyForm,
        category: 'Journal',
        author: 'UME Journal',
      };
    }

    if (type === 'tours') {
      return {
        ...emptyForm,
        totalSeats: '20',
        availableSeats: '20',
        rating: '0',
      };
    }

    return {
      ...emptyForm,
    };
  }

  return {
    name: record.name || '',
    region: record.region || '',
    tagline: record.tagline || '',
    description: record.description || '',

    heroImage: record.heroImage || '',
    bestTime: record.bestTime || '',

    recommendedDays:
      record.recommendedDays?.toString() || '',

    highlights: listToText(
      record.highlights
    ),

    experiences: listToText(
      record.experiences
    ),

    food: listToText(record.food),

    tips: listToText(record.tips),

    plannerEnabled: Boolean(record.plannerEnabled),
    plannerBasePrice: record.plannerBasePrice?.toString() || '0',
    plannerSortOrder: record.plannerSortOrder?.toString() || '0',

    title: record.title || '',
    eyebrow: record.eyebrow || '',
    duration: record.duration || '',
    price: record.price?.toString() || '',

    totalSeats:
      record.totalSeats?.toString() || '',

    availableSeats:
      record.availableSeats?.toString() || '',

    destinations: listToText(
      record.destinations
    ),

    category: record.category || '',

    rating:
      record.rating?.toString() || '',

    hotel: record.hotel || '',
    transport: record.transport || '',
    difficulty: record.difficulty || '',
    ideal: record.ideal || '',

    image: record.image || '',
    location: record.location || '',
    date: record.date || '',

    startDate: toDateInput(
      record.startDate
    ),

    endDate: toDateInput(
      record.endDate
    ),

    author:
      record.author || 'UME Journal',

    reading: record.reading || '',

    excerpt: record.excerpt || '',

    content: listToHtml(
      record.content
    ),

    itinerary: Array.isArray(
      record.itinerary
    )
      ? record.itinerary
          .map(
            (x: any) =>
              `${x.day || ''}|${x.title || ''}|${
                x.text || ''
              }`
          )
          .join('\n')
      : '',

    isPublished:
      record.isPublished !== false,

    featured:
      Boolean(record.featured),

    metaTitle:
      record.metaTitle || '',

    metaDescription:
      record.metaDescription || '',

    canonicalUrl:
      record.canonicalUrl || '',

    ogImage:
      record.ogImage || '',

    noIndex:
      Boolean(record.noIndex),
  };
}


function lines(value?: string) {
  return String(value || '')
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}


function parseItinerary(
  value?: string
) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [
        day,
        title,
        text,
      ] = line
        .split('|')
        .map((x) => x.trim());

      return {
        day: day || '1',
        title: title || 'Day',
        text: text || '',
      };
    });
}


function toPayload(
  type: ResourceType,
  f: FormState
) {
  const base: any = {
    isPublished: f.isPublished,
    featured: f.featured,

    metaTitle:
      f.metaTitle?.trim(),

    metaDescription:
      f.metaDescription?.trim(),

    canonicalUrl:
      f.canonicalUrl?.trim(),

    ogImage:
      f.ogImage?.trim(),

    noIndex:
      f.noIndex,
  };


  if (type === 'destinations') {
    return {
      ...base,

      name: f.name?.trim(),

      region:
        f.region?.trim(),

      tagline:
        f.tagline?.trim(),

      description:
        f.description?.trim(),

      heroImage:
        f.heroImage?.trim(),

      bestTime:
        f.bestTime?.trim(),

      recommendedDays:
        f.recommendedDays
          ? Number(
              f.recommendedDays
            )
          : undefined,

      highlights:
        lines(f.highlights),

      experiences:
        lines(f.experiences),

      food:
        lines(f.food),

      tips:
        lines(f.tips),

      plannerEnabled:
        Boolean(f.plannerEnabled),

      plannerBasePrice:
        Number(f.plannerBasePrice) || 0,

      plannerSortOrder:
        Number(f.plannerSortOrder) || 0,
    };
  }


  if (type === 'tours') {
    return {
      ...base,

      title:
        f.title?.trim(),

      eyebrow:
        f.eyebrow?.trim(),

      duration:
        f.duration?.trim(),

      price:
        Number(f.price),

      totalSeats:
        Number(f.totalSeats),

      availableSeats:
        Number(
          f.availableSeats
        ),

      destinations:
        lines(f.destinations),

      category:
        f.category?.trim(),

      rating:
        f.rating
          ? Number(f.rating)
          : 0,

      hotel:
        f.hotel?.trim(),

      transport:
        f.transport?.trim(),

      difficulty:
        f.difficulty?.trim(),

      ideal:
        f.ideal?.trim(),

      image:
        f.image?.trim(),

      description:
        f.description?.trim(),

      highlights:
        lines(f.highlights),

      itinerary:
        parseItinerary(
          f.itinerary
        ),
    };
  }


  if (type === 'experiences') {
    return {
      ...base,

      title:
        f.title?.trim(),

      location:
        f.location?.trim(),

      duration:
        f.duration?.trim(),

      description:
        f.description?.trim(),

      image:
        f.image?.trim(),

      category:
        f.category?.trim(),
    };
  }


  if (type === 'events') {
    return {
      ...base,

      title:
        f.title?.trim(),

      location:
        f.location?.trim(),

      category:
        f.category?.trim(),

      date:
        f.date?.trim(),

      startDate:
        f.startDate
          ? new Date(
              `${f.startDate}T00:00:00`
            ).toISOString()
          : undefined,

      endDate:
        f.endDate
          ? new Date(
              `${f.endDate}T00:00:00`
            ).toISOString()
          : undefined,

      image:
        f.image?.trim(),

      description:
        f.description?.trim(),

      highlights:
        lines(f.highlights),
    };
  }


  return {
    ...base,

    title:
      f.title?.trim(),

    category:
      f.category?.trim(),

    author:
      f.author?.trim(),

    date:
      f.date
        ? new Date(
            `${f.date}T00:00:00`
          ).toISOString()
        : undefined,

    reading:
      f.reading?.trim(),

    excerpt:
      f.excerpt?.trim(),

    image:
      f.image?.trim(),

    content: [
      f.content || '',
    ],
  };
}


function validate(
  type: ResourceType,
  f: FormState
) {
  const required: Record<
    ResourceType,
    string[]
  > = {
    destinations: [
      'name',
      'region',
      'description',
      'heroImage',
    ],

    tours: [
      'title',
      'duration',
      'price',
      'totalSeats',
      'availableSeats',
      'image',
      'description',
    ],

    experiences: [
      'title',
      'location',
      'description',
      'image',
    ],

    events: [
      'title',
      'location',
    ],

    stories: [
      'title',
      'image',
      'content',
    ],
  };


  for (
    const key of required[type]
  ) {
    const value =
      (f as any)[key];


    const empty =
      [
        'description',
        'excerpt',
        'content',
      ].includes(key)
        ? isRichTextEmpty(value)
        : !String(
            value || ''
          ).trim();


    if (empty) {
      throw new Error(
        `${key} is required`
      );
    }
  }


  if (type === 'tours') {
    const total =
      Number(f.totalSeats);

    const available =
      Number(
        f.availableSeats
      );

    const price =
      Number(f.price);


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        'Price must be a valid number'
      );
    }


    if (
      !Number.isInteger(total) ||
      total < 1
    ) {
      throw new Error(
        'Total seats must be at least 1'
      );
    }


    if (
      !Number.isInteger(
        available
      ) ||
      available < 0 ||
      available > total
    ) {
      throw new Error(
        'Available seats must be between 0 and total seats'
      );
    }


    if (
      f.rating &&
      (
        Number(f.rating) < 0 ||
        Number(f.rating) > 5
      )
    ) {
      throw new Error(
        'Rating must be between 0 and 5'
      );
    }
  }


  if (
    type === 'destinations' &&
    f.recommendedDays &&
    Number(
      f.recommendedDays
    ) < 1
  ) {
    throw new Error(
      'Recommended days must be at least 1'
    );
  }


  if (
    type === 'destinations' &&
    (!Number.isFinite(Number(f.plannerBasePrice || 0)) ||
      Number(f.plannerBasePrice || 0) < 0)
  ) {
    throw new Error(
      'Planner base price must be 0 or more'
    );
  }


  if (
    type === 'events' &&
    f.startDate &&
    f.endDate &&
    new Date(f.endDate) <
      new Date(f.startDate)
  ) {
    throw new Error(
      'End date cannot be before start date'
    );
  }
}


export default function ResourceManager({
  type,
}: {
  type: string;
}) {
  const cfg =
    CONFIGS[
      type as ResourceType
    ];

  const resourceType =
    type as ResourceType;


  const [
    items,
    setItems,
  ] = useState<any[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    editing,
    setEditing,
  ] = useState<any | null>(
    null
  );


  const [
    form,
    setForm,
  ] = useState<FormState>(
    emptyForm
  );


  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    q,
    setQ,
  ] = useState('');


  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');


  const [
    viewing,
    setViewing,
  ] = useState<any | null>(
    null
  );


  const [
    statusUpdating,
    setStatusUpdating,
  ] = useState<string | null>(
    null
  );


  const fileRef =
    useRef<HTMLInputElement>(
      null
    );


  const imageField =
    resourceType ===
    'destinations'
      ? 'heroImage'
      : 'image';


  const load = async () => {
    if (!cfg) return;


    setLoading(true);
    setError('');


    try {
      const first =
        await api<{
          data?: any[];
          meta?: {
            pages?: number;
          };
        }>(
          `${cfg.endpoint}?page=1&limit=200&q=${encodeURIComponent(
            q
          )}`
        );


      const pages =
        Math.max(
          1,
          Number(
            first.meta?.pages
          ) || 1
        );


      const all = [
        ...(first.data || []),
      ];


      for (
        let page = 2;
        page <= pages;
        page += 1
      ) {
        const next =
          await api<{
            data?: any[];
          }>(
            `${cfg.endpoint}?page=${page}&limit=200&q=${encodeURIComponent(
              q
            )}`
          );


        all.push(
          ...(next.data || [])
        );
      }


      setItems(all);
    } catch (e: any) {
      setError(
        e.message ||
          'Failed to load records'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    void load();
  }, [type]);


  const set = (
    key: keyof FormState,
    value: any
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };


  const uploadImage = async (
    file: File
  ) => {
    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setError(
        'Please select an image file'
      );
      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        'Image must be 5MB or smaller'
      );
      return;
    }


    try {
      setError('');
      setUploading(true);


      const fd =
        new FormData();

      fd.append(
        'image',
        file
      );

      fd.append(
        'folder',
        `ume-holidays/${resourceType}`
      );


      const response =
        await api<{
          data?: {
            url?: string;
          };
        }>(
          '/uploads/image',
          {
            method: 'POST',
            body: fd,
          }
        );


      const url =
        response?.data?.url;


      if (!url) {
        throw new Error(
          'Upload succeeded but no image URL was returned'
        );
      }


      set(
        imageField as keyof FormState,
        url
      );
    } catch (e: any) {
      setError(
        e.message ||
          'Image upload failed'
      );
    } finally {
      setUploading(false);
    }
  };


  const startNew = () => {
    setError('');

    setEditing(null);

    setForm(
      toForm(resourceType)
    );

    setOpen(true);
  };


  const startEdit = (
    item: any
  ) => {
    setError('');

    setEditing(item);

    setForm(
      toForm(
        resourceType,
        item
      )
    );

    setOpen(true);
  };


  const close = () => {
    if (
      saving ||
      uploading
    ) {
      return;
    }

    setOpen(false);

    setEditing(null);

    setForm(emptyForm);
  };


  const save = async () => {
    try {
      setError('');

      validate(
        resourceType,
        form
      );

      setSaving(true);


      const payload =
        toPayload(
          resourceType,
          form
        );


      if (editing) {
        await api(
          `${cfg.endpoint}/${editing._id || editing.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(
              payload
            ),
          }
        );
      } else {
        await api(
          cfg.endpoint,
          {
            method: 'POST',
            body: JSON.stringify(
              payload
            ),
          }
        );
      }


      close();

      await load();
    } catch (e: any) {
      setError(
        e.message ||
          'Failed to save record'
      );
    } finally {
      setSaving(false);
    }
  };


  if (!cfg) {
    return (
      <div className="
        rounded-2xl
        bg-red-50
        p-5
        font-semibold
        text-red-700
      ">
        Unknown module.
      </div>
    );
  }


  const imageValue =
    (form as any)[
      imageField
    ] || '';


  const title = editing
    ? `Edit ${cfg.title.slice(
        0,
        -1
      )}`
    : `Create ${cfg.title.slice(
        0,
        -1
      )}`;


  const visible =
    statusFilter === 'all'
      ? items
      : items.filter(
          (x) =>
            (x.isPublished !==
              false) ===
            (statusFilter ===
              'active')
        );


  const togglePublished =
    async (x: any) => {
      const id =
        x._id || x.id;


      try {
        setStatusUpdating(
          String(id)
        );


        await api(
          `${cfg.endpoint}/${id}`,
          {
            method: 'PATCH',

            body: JSON.stringify({
              isPublished:
                x.isPublished ===
                false,
            }),
          }
        );


        await load();
      } catch (e: any) {
        setError(
          e.message ||
            'Failed to update status'
        );
      } finally {
        setStatusUpdating(
          null
        );
      }
    };


  const formatDetailValue = (
    key: string,
    value: any
  ) => {
    if (
      value ===
        undefined ||
      value === null ||
      value === ''
    ) {
      return '—';
    }


    if (
      key ===
        'description' ||
      key === 'excerpt' ||
      key === 'content'
    ) {
      if (
        Array.isArray(value)
      ) {
        return (
          <div className="space-y-2">
            {value.map(
              (
                v: any,
                i: number
              ) => (
                <RichText
                  key={`${key}-${i}`}
                  value={v}
                />
              )
            )}
          </div>
        );
      }


      return (
        <RichText
          value={value}
        />
      );
    }


    if (
      Array.isArray(value)
    ) {
      return value.length
        ? value.join(', ')
        : '—';
    }


    if (
      typeof value ===
      'boolean'
    ) {
      return value
        ? 'Yes'
        : 'No';
    }


    if (
      [
        'startDate',
        'endDate',
        'date',
        'createdAt',
        'updatedAt',
      ].includes(key) &&
      !Number.isNaN(
        new Date(
          value
        ).getTime()
      )
    ) {
      return new Date(
        value
      ).toLocaleString();
    }


    if (
      typeof value ===
      'object'
    ) {
      return JSON.stringify(
        value
      );
    }


    return String(value);
  };


  const detailKeys = (
    x: any
  ) =>
    Object.keys(x).filter(
      (key) =>
        ![
          '_id',
          '__v',
        ].includes(key)
    );


  const remove = async (
    x: any
  ) => {
    if (
      !confirm(
        'Delete this record?'
      )
    ) {
      return;
    }


    try {
      await api(
        `${cfg.endpoint}/${x._id || x.id}`,
        {
          method: 'DELETE',
        }
      );

      await load();
    } catch (e: any) {
      setError(
        e.message ||
          'Failed to delete record'
      );
    }
  };


  const publicPath = (
    x: any
  ) =>
    x.slug
      ? `/${resourceType}/${x.slug}`
      : '';


  const moreItems = (
    x: any
  ): MoreItem[] => {
    const path =
      publicPath(x);


    return [
      ...(path &&
      x.isPublished !==
        false
        ? [
            {
              label:
                'Copy public link',
              icon: Link2,
              copy: () =>
                `${window.location.origin}${path}`,
            },
          ]
        : []),

      {
        label: 'Copy ID',
        icon: Copy,
        copy: String(
          x._id || x.id
        ),
      },
    ];
  };


  return (
    <div>

      {/* PAGE HEADER */}

      <div className="
        mb-7
        flex
        flex-col
        justify-between
        gap-4
        sm:flex-row
        sm:items-end
      ">

        <div>
          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-[.25em]
            text-[#6B7280]
          ">
            Content management
          </p>

        </div>


        <button
          type="button"
          onClick={startNew}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#b76b43]
            px-5
            py-3
            text-sm
            font-extrabold
            text-white
            transition-colors
            hover:bg-[#934f30]
          "
        >
          <Plus
            aria-hidden
            strokeWidth={2}
            className="h-4 w-4"
          />

          Add {cfg.title.slice(0, -1)}
        </button>

      </div>


      {/* SEARCH / FILTERS */}

      <div className="
        mb-5
        flex
        flex-wrap
        gap-2
      ">

        <SearchField
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === 'Enter'
            ) {
              void load();
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
          onChange={
            setStatusFilter
          }
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


      {/* ERROR */}

      {error && !open && (
        <div className="
          mb-5
          rounded-xl
          border
          border-red-200
          bg-red-50
          p-3
          text-sm
          font-semibold
          text-red-700
        ">
          {error}
        </div>
      )}


      {/* TABLE */}

      {loading ? (
        <div className="
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-10
          text-center
          text-sm
          font-bold
          text-[#64748B]
        ">
          Loading…
        </div>
      ) : (
        <div className="
          overflow-x-auto
          rounded-2xl
          border
          border-[#1E293B]
          bg-white
          shadow-[0_4px_18px_rgba(15,23,42,0.08)]
        ">

          <table className="
            w-full
            min-w-[1050px]
            text-left
            text-sm
          ">

            <thead>
              <tr className="
                border-b
                border-[#334155]
                bg-[#b76b43]
              ">

                {cfg.columns.map(
                  (c) => (
                    <th
                      key={c}
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        text-xs
                        font-extrabold
                        uppercase
                        tracking-wider
                        text-white
                      "
                    >
                      {c ===
                      'isPublished'
                        ? 'Status'
                        : c ===
                            'featured'
                          ? 'Featured'
                          : c ===
                              'seo'
                            ? 'SEO'
                            : c ===
                                'planner'
                              ? 'Planner'
                              : c}
                    </th>
                  )
                )}


                <th className="
                  whitespace-nowrap
                  px-4
                  py-4
                  text-xs
                  font-extrabold
                  uppercase
                  tracking-wider
                  text-white
                ">
                  Full Data
                </th>


                <th className="
                  whitespace-nowrap
                  px-4
                  py-4
                  text-xs
                  font-extrabold
                  uppercase
                  tracking-wider
                  text-white
                ">
                  Actions
                </th>

              </tr>
            </thead>


            <tbody className="
              divide-y
              divide-[#E5E7EB]
              bg-white
            ">

              {visible.map(
                (x) => {
                  const id =
                    String(
                      x._id ||
                        x.id
                    );


                  return (
                    <tr
                      key={id}
                      className="
                        group
                        bg-white
                        transition-colors
                        duration-150
                        hover:bg-[#F8FAFC]
                      "
                    >

                      {cfg.columns.map(
                        (c) => (
                          <td
                            key={c}
                            className="
                              max-w-[260px]
                              px-4
                              py-4
                              align-top
                              text-sm
                              font-bold
                              text-[#111827]
                            "
                          >

                            {c ===
                            'seo' ? (
                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-extrabold
                                  ${
                                    x.metaTitle &&
                                    x.metaDescription
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                                      : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                  }
                                `}
                              >
                                {x.metaTitle &&
                                x.metaDescription
                                  ? 'Complete'
                                  : 'Needs SEO'}
                              </span>

                            ) : c ===
                              'planner' ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset ${
                                  x.plannerEnabled && x.isPublished !== false
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : 'bg-slate-100 text-slate-600 ring-slate-200'
                                }`}
                              >
                                {x.plannerEnabled
                                  ? `₹${Number(x.plannerBasePrice || 0).toLocaleString('en-IN')}/day`
                                  : 'Off'}
                              </span>
                            ) : c ===
                              'isPublished' ? (

                              <button
                                type="button"
                                disabled={
                                  statusUpdating ===
                                  id
                                }
                                onClick={() =>
                                  togglePublished(
                                    x
                                  )
                                }
                                className={`
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-full
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-extrabold
                                  transition-all
                                  duration-150
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                  ${
                                    x.isPublished !==
                                    false
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-200'
                                  }
                                `}
                              >

                                {x.isPublished !==
                                false ? (
                                  <Check
                                    className="h-3.5 w-3.5"
                                    strokeWidth={
                                      2.5
                                    }
                                  />
                                ) : (
                                  <X
                                    className="h-3.5 w-3.5"
                                    strokeWidth={
                                      2.5
                                    }
                                  />
                                )}


                                {statusUpdating ===
                                id
                                  ? 'Updating…'
                                  : x.isPublished !==
                                      false
                                    ? 'Active'
                                    : 'Inactive'}

                              </button>

                            ) : c ===
                              'featured' ? (

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-extrabold
                                  ${
                                    x[c]
                                      ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                      : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
                                  }
                                `}
                              >
                                {x[c]
                                  ? 'Yes'
                                  : 'No'}
                              </span>

                            ) : c ===
                                'startDate' &&
                              x[c] ? (

                              <span className="
                                font-bold
                                text-[#334155]
                              ">
                                {new Date(
                                  x[c]
                                ).toLocaleDateString()}
                              </span>

                            ) : Array.isArray(
                                x[c]
                              ) ? (

                              <span className="
                                font-bold
                                text-[#111827]
                              ">
                                {x[c].join(
                                  ', '
                                )}
                              </span>

                            ) : (

                              <span className="
                                font-bold
                                text-[#111827]
                              ">
                                {String(
                                  x[c] ??
                                    '—'
                                )}
                              </span>

                            )}

                          </td>
                        )
                      )}


                      {/* FULL VIEW */}

                      <td className="px-4 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setViewing(
                              x
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-[#CBD5E1]
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-extrabold
                            text-[#111827]
                            shadow-sm
                            transition-all
                            duration-150
                            hover:border-[#111827]
                            hover:bg-[#b76b43]
                            hover:text-white
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#111827]/20
                          "
                        >

                          <Eye
                            className="h-4 w-4"
                            strokeWidth={2}
                          />

                          Full View

                        </button>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-4 py-4">

                        <RowActions
                          viewHref={
                            x.isPublished !==
                              false &&
                            publicPath(
                              x
                            )
                              ? publicPath(
                                  x
                                )
                              : undefined
                          }

                          viewDisabled={
                            x.isPublished ===
                            false
                              ? 'Not published — hidden on the website'
                              : !publicPath(
                                    x
                                  )
                                ? 'No public page yet'
                                : undefined
                          }

                          onEdit={() =>
                            startEdit(
                              x
                            )
                          }

                          onDelete={() =>
                            remove(x)
                          }

                          more={moreItems(
                            x
                          )}
                        />

                      </td>

                    </tr>
                  );
                }
              )}


              {/* EMPTY */}

              {!visible.length && (
                <tr>

                  <td
                    colSpan={
                      cfg.columns
                        .length +
                      2
                    }
                    className="
                      px-5
                      py-14
                      text-center
                    "
                  >

                    <div className="
                      flex
                      flex-col
                      items-center
                    ">

                      <div className="
                        grid
                        h-11
                        w-11
                        place-items-center
                        rounded-xl
                        bg-[#F1F5F9]
                      ">
                        <Search
                          className="h-5 w-5 text-[#64748B]"
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>


                      <p className="
                        mt-3
                        text-sm
                        font-extrabold
                        text-[#111827]
                      ">
                        No records found.
                      </p>


                      <p className="
                        mt-1
                        text-xs
                        font-semibold
                        text-[#64748B]
                      ">
                        Try changing your search or filters.
                      </p>

                    </div>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}


      {/* FULL VIEW */}

      {viewing && (
        <DetailsDialog
          title={`${cfg.title.slice(
            0,
            -1
          )} details`}
          subtitle={
            viewing.name ||
            viewing.title ||
            viewing.slug
          }
          onClose={() =>
            setViewing(null)
          }
          rows={detailKeys(
            viewing
          ).map((key) => [
            key,
            formatDetailValue(
              key,
              viewing[key]
            ),
          ])}
        />
      )}


      {/* CREATE / EDIT MODAL */}

      {open && (
        <div className="
          fixed
          inset-0
          z-50
          grid
          place-items-center
          bg-black/50
          p-4
        ">

          <div className="
            max-h-[94vh]
            w-full
            max-w-6xl
            overflow-auto
            rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
            shadow-[0_18px_50px_rgba(17,24,39,0.16)]
          ">

            {/* MODAL HEADER */}

            <div className="
              sticky
              top-0
              z-10
              flex
              items-center
              justify-between
              border-b
              border-[#E5E7EB]
              bg-white
              px-7
              py-5
            ">

              <div>

                <h2 className="
                  font-serif
                  text-3xl
                  font-bold
                  text-[#111827]
                ">
                  {title}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  font-semibold
                  text-[#6B7280]
                ">
                  All fields are validated before sending data to the backend.
                </p>

              </div>


              <button
                type="button"
                onClick={close}
                disabled={
                  saving ||
                  uploading
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-2xl
                  text-[#6B7280]
                  transition
                  hover:bg-[#F1F5F9]
                  hover:text-[#111827]
                  disabled:opacity-50
                "
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {error && (
              <div className="
                mx-7
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-3
                text-sm
                font-semibold
                text-red-700
              ">
                {error}
              </div>
            )}


            <div className="
              grid
              gap-6
              p-7
              lg:grid-cols-2
            ">

              {/* DESTINATIONS */}

              {resourceType ===
                'destinations' && (
                <>
                  <Field
                    label="Name"
                    required
                  >
                    <Input
                      icon={MapPin}
                      value={
                        form.name ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'name',
                          e.target.value
                        )
                      }
                      placeholder="Jaipur"
                    />
                  </Field>


                  <Field
                    label="Region"
                    required
                  >
                    <Input
                      icon={MapIcon}
                      value={
                        form.region ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'region',
                          e.target.value
                        )
                      }
                      placeholder="Rajasthan"
                    />
                  </Field>


                  <Field label="Tagline">
                    <Input
                      icon={Sparkles}
                      value={
                        form.tagline ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'tagline',
                          e.target.value
                        )
                      }
                      placeholder="The Pink City"
                    />
                  </Field>


                  <Field label="Best Time">
                    <Input
                      icon={Calendar}
                      value={
                        form.bestTime ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'bestTime',
                          e.target.value
                        )
                      }
                      placeholder="October–March"
                    />
                  </Field>


                  <Field label="Recommended Days">
                    <Input
                      icon={
                        CalendarRange
                      }
                      type="number"
                      min="1"
                      max="60"
                      value={
                        form.recommendedDays ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'recommendedDays',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <ImageField
                    value={
                      imageValue
                    }
                    onChange={(v) =>
                      set(
                        imageField as keyof FormState,
                        v
                      )
                    }
                    onUpload={
                      uploadImage
                    }
                    inputRef={
                      fileRef
                    }
                    uploading={
                      uploading
                    }
                    label="Hero Image"
                    required
                  />


                  <div className="lg:col-span-2">
                    <Field
                      label="Description"
                      required
                    >
                      <RichTextEditor
                        value={
                          form.description ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'description',
                            v
                          )
                        }
                        placeholder="Describe this Rajasthan destination…"
                      />
                    </Field>
                  </div>


                  <ListField
                    label="Highlights"
                    value={
                      form.highlights ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'highlights',
                        v
                      )
                    }
                    placeholder={
                      'Amer Fort\nCity Palace'
                    }
                  />


                  <ListField
                    label="Experiences"
                    value={
                      form.experiences ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'experiences',
                        v
                      )
                    }
                    placeholder={
                      'Heritage walk\nLocal market'
                    }
                  />


                  <ListField
                    label="Food"
                    value={
                      form.food ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'food',
                        v
                      )
                    }
                    placeholder="Dal baati churma"
                  />


                  <ListField
                    label="Tips"
                    value={
                      form.tips ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'tips',
                        v
                      )
                    }
                    placeholder="Start early"
                  />


                  <div className="
                    grid
                    gap-4
                    rounded-2xl
                    border
                    border-[#E2E8F0]
                    bg-[#F8FAFC]
                    p-5
                    sm:grid-cols-3
                    lg:col-span-2
                  ">
                    <div className="sm:col-span-3">
                      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#64748B]">
                        Travel Planner
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#64748B]">
                        Shown on /plan-your-trip when published and enabled. The tagline is used as the card description.
                      </p>
                    </div>

                    <Toggle
                      checked={Boolean(form.plannerEnabled)}
                      onChange={(v) => set('plannerEnabled', v)}
                      label="Show in planner"
                    />

                    <Field label="Base price / adult / day (₹)">
                      <Input
                        icon={IndianRupee}
                        type="number"
                        min="0"
                        value={form.plannerBasePrice || ''}
                        onChange={(e) => set('plannerBasePrice', e.target.value)}
                      />
                    </Field>

                    <Field label="Planner order">
                      <Input
                        icon={List}
                        type="number"
                        value={form.plannerSortOrder || ''}
                        onChange={(e) => set('plannerSortOrder', e.target.value)}
                      />
                    </Field>
                  </div>
                </>
              )}


              {/* TOURS */}

              {resourceType ===
                'tours' && (
                <>
                  <Field
                    label="Title"
                    required
                  >
                    <Input
                      icon={Type}
                      value={
                        form.title ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="Royal Rajasthan Escape"
                    />
                  </Field>


                  <Field label="Eyebrow">
                    <Input
                      icon={Sparkles}
                      value={
                        form.eyebrow ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'eyebrow',
                          e.target.value
                        )
                      }
                      placeholder="Signature Journey"
                    />
                  </Field>


                  <Field
                    label="Duration"
                    required
                  >
                    <Input
                      icon={Clock}
                      value={
                        form.duration ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'duration',
                          e.target.value
                        )
                      }
                      placeholder="7 Days / 6 Nights"
                    />
                  </Field>


                  <Field
                    label="Price (₹)"
                    required
                  >
                    <Input
                      icon={
                        IndianRupee
                      }
                      type="number"
                      min="0"
                      value={
                        form.price ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'price',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <Field
                    label="Total Seats"
                    required
                  >
                    <Input
                      icon={Users}
                      type="number"
                      min="1"
                      value={
                        form.totalSeats ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'totalSeats',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <Field
                    label="Available Seats"
                    required
                  >
                    <Input
                      icon={
                        UserCheck
                      }
                      type="number"
                      min="0"
                      value={
                        form.availableSeats ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'availableSeats',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <Field label="Category">
                    <Input
                      icon={Tag}
                      value={
                        form.category ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="Heritage"
                    />
                  </Field>


                  <Field label="Rating (0–5)">
                    <Input
                      icon={Star}
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={
                        form.rating ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'rating',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <Field label="Hotel">
                    <Input
                      icon={Hotel}
                      value={
                        form.hotel ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'hotel',
                          e.target.value
                        )
                      }
                      placeholder="Luxury heritage"
                    />
                  </Field>


                  <Field label="Transport">
                    <Input
                      icon={Car}
                      value={
                        form.transport ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'transport',
                          e.target.value
                        )
                      }
                      placeholder="Private vehicle"
                    />
                  </Field>


                  <Field label="Difficulty">
                    <Input
                      icon={Gauge}
                      value={
                        form.difficulty ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'difficulty',
                          e.target.value
                        )
                      }
                      placeholder="Easy"
                    />
                  </Field>


                  <Field label="Ideal For">
                    <Input
                      icon={Heart}
                      value={
                        form.ideal ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'ideal',
                          e.target.value
                        )
                      }
                      placeholder="Couples and families"
                    />
                  </Field>


                  <ImageField
                    value={
                      imageValue
                    }
                    onChange={(v) =>
                      set(
                        'image',
                        v
                      )
                    }
                    onUpload={
                      uploadImage
                    }
                    inputRef={
                      fileRef
                    }
                    uploading={
                      uploading
                    }
                    label="Tour Image"
                    required
                  />


                  <ListField
                    icon={MapPin}
                    label="Destinations"
                    value={
                      form.destinations ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'destinations',
                        v
                      )
                    }
                    placeholder={
                      'Jaipur\nJodhpur\nUdaipur'
                    }
                  />


                  <div className="lg:col-span-2">
                    <Field
                      label="Description"
                      required
                    >
                      <RichTextEditor
                        value={
                          form.description ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'description',
                            v
                          )
                        }
                        placeholder="Write a clear tour description…"
                      />
                    </Field>
                  </div>


                  <ListField
                    label="Highlights"
                    value={
                      form.highlights ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'highlights',
                        v
                      )
                    }
                    placeholder={
                      'Forts\nPalaces\nLocal cuisine'
                    }
                  />


                  <Field label="Itinerary">
                    <Textarea
                      icon={Route}
                      rows={7}
                      value={
                        form.itinerary ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'itinerary',
                          e.target.value
                        )
                      }
                      placeholder={
                        'One day per line: day|title|description\n1|Arrive Jaipur|Airport pickup and heritage dinner.\n2|Jaipur Heritage|Fort and palace tour.'
                      }
                    />
                  </Field>
                </>
              )}


              {/* EXPERIENCES */}

              {resourceType ===
                'experiences' && (
                <>
                  <Field
                    label="Title"
                    required
                  >
                    <Input
                      icon={Type}
                      value={
                        form.title ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="Sunrise at Amer"
                    />
                  </Field>


                  <Field
                    label="Location"
                    required
                  >
                    <Input
                      icon={MapPin}
                      value={
                        form.location ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'location',
                          e.target.value
                        )
                      }
                      placeholder="Jaipur, Rajasthan"
                    />
                  </Field>


                  <Field label="Duration">
                    <Input
                      icon={Clock}
                      value={
                        form.duration ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'duration',
                          e.target.value
                        )
                      }
                      placeholder="3 hours"
                    />
                  </Field>


                  <Field label="Category">
                    <Input
                      icon={Tag}
                      value={
                        form.category ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="Heritage"
                    />
                  </Field>


                  <ImageField
                    value={
                      imageValue
                    }
                    onChange={(v) =>
                      set(
                        'image',
                        v
                      )
                    }
                    onUpload={
                      uploadImage
                    }
                    inputRef={
                      fileRef
                    }
                    uploading={
                      uploading
                    }
                    label="Experience Image"
                    required
                  />


                  <div className="lg:col-span-2">
                    <Field
                      label="Description"
                      required
                    >
                      <RichTextEditor
                        value={
                          form.description ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'description',
                            v
                          )
                        }
                        placeholder="Describe this experience…"
                      />
                    </Field>
                  </div>
                </>
              )}


              {/* EVENTS */}

              {resourceType ===
                'events' && (
                <>
                  <Field
                    label="Title"
                    required
                  >
                    <Input
                      icon={Type}
                      value={
                        form.title ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="Pushkar Camel Fair"
                    />
                  </Field>


                  <Field
                    label="Location"
                    required
                  >
                    <Input
                      icon={MapPin}
                      value={
                        form.location ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'location',
                          e.target.value
                        )
                      }
                      placeholder="Pushkar, Rajasthan"
                    />
                  </Field>


                  <Field label="Category">
                    <Input
                      icon={Tag}
                      value={
                        form.category ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="Festival"
                    />
                  </Field>


                  <Field label="Date Label">
                    <Input
                      icon={Calendar}
                      value={
                        form.date ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'date',
                          e.target.value
                        )
                      }
                      placeholder="November — dates vary"
                    />
                  </Field>


                  <Field label="Start Date">
                    <Input
                      icon={Calendar}
                      type="date"
                      value={
                        form.startDate ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'startDate',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <Field label="End Date">
                    <Input
                      icon={Calendar}
                      type="date"
                      value={
                        form.endDate ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'endDate',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <ImageField
                    value={
                      imageValue
                    }
                    onChange={(v) =>
                      set(
                        'image',
                        v
                      )
                    }
                    onUpload={
                      uploadImage
                    }
                    inputRef={
                      fileRef
                    }
                    uploading={
                      uploading
                    }
                    label="Event Image"
                  />


                  <ListField
                    label="Highlights"
                    value={
                      form.highlights ||
                      ''
                    }
                    onChange={(v) =>
                      set(
                        'highlights',
                        v
                      )
                    }
                    placeholder={
                      'Camel fair\nFolk music'
                    }
                  />


                  <div className="lg:col-span-2">
                    <Field label="Description">
                      <RichTextEditor
                        value={
                          form.description ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'description',
                            v
                          )
                        }
                        placeholder="Describe this event…"
                      />
                    </Field>
                  </div>
                </>
              )}


              {/* STORIES */}

              {resourceType ===
                'stories' && (
                <>
                  <Field
                    label="Title"
                    required
                  >
                    <Input
                      icon={Type}
                      value={
                        form.title ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="A Slow Morning in Jaipur"
                    />
                  </Field>


                  <Field label="Category">
                    <Input
                      icon={Tag}
                      value={
                        form.category ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="Journal"
                    />
                  </Field>


                  <Field label="Author">
                    <Input
                      icon={User}
                      value={
                        form.author ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'author',
                          e.target.value
                        )
                      }
                      placeholder="UME Journal"
                    />
                  </Field>


                  <Field label="Reading Time">
                    <Input
                      icon={Clock}
                      value={
                        form.reading ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'reading',
                          e.target.value
                        )
                      }
                      placeholder="6 min read"
                    />
                  </Field>


                  <Field label="Publish Date">
                    <Input
                      icon={Calendar}
                      type="date"
                      value={
                        form.date ||
                        ''
                      }
                      onChange={(e) =>
                        set(
                          'date',
                          e.target.value
                        )
                      }
                    />
                  </Field>


                  <ImageField
                    value={
                      imageValue
                    }
                    onChange={(v) =>
                      set(
                        'image',
                        v
                      )
                    }
                    onUpload={
                      uploadImage
                    }
                    inputRef={
                      fileRef
                    }
                    uploading={
                      uploading
                    }
                    label="Cover Image"
                    required
                  />


                  <div className="lg:col-span-2">
                    <Field label="Excerpt">
                      <RichTextEditor
                        value={
                          form.excerpt ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'excerpt',
                            v
                          )
                        }
                        placeholder="Short story introduction…"
                      />
                    </Field>
                  </div>


                  <div className="lg:col-span-2">
                    <Field
                      label="Content"
                      required
                    >
                      <RichTextEditor
                        value={
                          form.content ||
                          ''
                        }
                        onChange={(v) =>
                          set(
                            'content',
                            v
                          )
                        }
                        placeholder="Write your travel story…"
                      />
                    </Field>
                  </div>
                </>
              )}


              {/* SEO */}

              <div className="
                lg:col-span-2
                rounded-2xl
                border
                border-[#E2E8F0]
                bg-[#F8FAFC]
                p-5
              ">

                <div className="mb-4">

                  <p className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[.22em]
                    text-[#64748B]
                  ">
                    SEO
                  </p>

                  <h3 className="
                    mt-1
                    font-bold
                    text-[#0F172A]
                  ">
                    Search engine metadata
                  </h3>

                  <p className="
                    mt-1
                    text-xs
                    font-medium
                    text-[#64748B]
                  ">
                    Optional fields; public URLs and slugs remain unchanged.
                  </p>

                </div>


                <div className="
                  grid
                  gap-4
                  sm:grid-cols-2
                ">

                  <Field label="Meta Title">
                    <Input
                      value={
                        form.metaTitle ||
                        ''
                      }
                      maxLength={70}
                      onChange={(e) =>
                        set(
                          'metaTitle',
                          e.target.value
                        )
                      }
                      placeholder="Page title for search engines"
                    />
                  </Field>


                  <Field label="Canonical URL">
                    <Input
                      value={
                        form.canonicalUrl ||
                        ''
                      }
                      maxLength={500}
                      onChange={(e) =>
                        set(
                          'canonicalUrl',
                          e.target.value
                        )
                      }
                      placeholder="https://umeholidays.com/..."
                    />
                  </Field>


                  <div className="sm:col-span-2">
                    <Field label="Meta Description">
                      <Textarea
                        rows={3}
                        value={
                          form.metaDescription ||
                          ''
                        }
                        maxLength={170}
                        onChange={(e) =>
                          set(
                            'metaDescription',
                            e.target.value
                          )
                        }
                        placeholder="Short description for search engines"
                      />
                    </Field>
                  </div>


                  <Field label="OG Image URL">
                    <Input
                      value={
                        form.ogImage ||
                        ''
                      }
                      maxLength={1000}
                      onChange={(e) =>
                        set(
                          'ogImage',
                          e.target.value
                        )
                      }
                      placeholder="Cloudinary or absolute image URL"
                    />
                  </Field>


                  <Toggle
                    checked={
                      form.noIndex
                    }
                    onChange={(v) =>
                      set(
                        'noIndex',
                        v
                      )
                    }
                    label="No Index"
                  />

                </div>

              </div>


              {/* PUBLISH / FEATURED */}

              <div className="
                grid
                gap-4
                lg:col-span-2
                sm:grid-cols-2
              ">

                <Toggle
                  checked={
                    form.isPublished
                  }
                  onChange={(v) =>
                    set(
                      'isPublished',
                      v
                    )
                  }
                  label="Published"
                />


                <Toggle
                  checked={
                    form.featured
                  }
                  onChange={(v) =>
                    set(
                      'featured',
                      v
                    )
                  }
                  label="Featured"
                />

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div className="
              flex
              justify-end
              gap-3
              border-t
              border-[#E5E7EB]
              bg-white
              px-7
              py-5
            ">

              <button
                type="button"
                onClick={close}
                disabled={
                  saving ||
                  uploading
                }
                className="
                  rounded-xl
                  border
                  border-[#CBD5E1]
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-[#334155]
                  transition
                  hover:bg-[#F8FAFC]
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={save}
                disabled={
                  saving ||
                  uploading
                }
                className="
                  rounded-xl
                  bg-[#b76b43]
                  px-6
                  py-3
                  text-sm
                  font-extrabold
                  text-white
                  transition-colors
                  hover:bg-[#934f30]
                  disabled:opacity-50
                "
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


function ListField({
  label,
  value,
  onChange,
  placeholder,
  icon = List,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
}) {
  return (
    <Field label={label}>
      <Textarea
        icon={icon}
        rows={5}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={`${placeholder || ''}\nOne item per line`}
      />
    </Field>
  );
}


function ImageField({
  value,
  onChange,
  onUpload,
  inputRef,
  uploading,
  label,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  uploading: boolean;
  label: string;
  required?: boolean;
}) {
  return (
    <Field
      label={label}
      required={required}
    >

      <div className="
        rounded-2xl
        border-2
        border-dashed
        border-[#E5E7EB]
        bg-[#F8FAFC]
        p-4
      ">

        {value ? (
          <img
            src={value}
            alt="Preview"
            className="
              mb-4
              h-48
              w-full
              rounded-xl
              bg-white
              object-contain
            "
            onError={(e) => {
              e.currentTarget.style.display =
                'none';
            }}
          />
        ) : (
          <div className="
            mb-4
            grid
            h-48
            place-items-center
            rounded-xl
            bg-white
            text-sm
            font-medium
            text-[#9CA3AF]
          ">
            Image preview
          </div>
        )}


        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const file =
              e.target.files?.[0];

            e.currentTarget.value =
              '';

            if (file) {
              onUpload(file);
            }
          }}
        />


        <div className="flex gap-2">

          <button
            type="button"
            disabled={uploading}
            onClick={() =>
              inputRef.current?.click()
            }
            className="
              flex-1
              rounded-xl
              border
              border-[#CBD5E1]
              bg-white
              px-4
              py-3
              text-sm
              font-bold
              text-[#111827]
              transition
              hover:bg-[#F8FAFC]
              disabled:opacity-50
            "
          >
            {uploading
              ? 'Uploading…'
              : 'Choose Image'}
          </button>


          <button
            type="button"
            disabled={
              !value ||
              uploading
            }
            onClick={() =>
              onChange('')
            }
            className="
              rounded-xl
              border
              border-red-200
              px-4
              py-3
              text-sm
              font-bold
              text-red-600
              transition
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            Remove
          </button>

        </div>


        <p className="
          mt-2
          text-xs
          font-medium
          text-[#6B7280]
        ">
          JPG, PNG, WEBP or GIF · maximum 5MB.
        </p>

      </div>

    </Field>
  );
}