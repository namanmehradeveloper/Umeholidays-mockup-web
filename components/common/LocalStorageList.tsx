'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type ItemType = 'tour' | 'destination' | 'experience' | 'event' | 'story';

type ListItem = {
  id?: string;
  slug: string;
  itemType: ItemType;
  item?: {
    title?: string;
    name?: string;
  };
};

const ITEM_TYPES = new Set<ItemType>([
  'tour',
  'destination',
  'experience',
  'event',
  'story',
]);

function localItems(raw: string | null): ListItem[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((value): ListItem[] => {
      if (typeof value !== 'string' || !value.trim()) return [];

      const entry = value.trim();
      const separator = entry.indexOf(':');
      let itemType: ItemType = 'tour';
      let slug = entry;

      if (separator !== -1) {
        const candidate = entry.slice(0, separator) as ItemType;
        const candidateSlug = entry.slice(separator + 1).trim();

        if (ITEM_TYPES.has(candidate) && candidateSlug) {
          itemType = candidate;
          slug = candidateSlug;
        }
      }

      return [
        {
          slug,
          itemType,
          item: { title: slug },
        },
      ];
    });
  } catch {
    return [];
  }
}

function itemHref(item: ListItem) {
  const collection = item.itemType === 'tour' ? 'tours' : `${item.itemType}s`;
  return `/${collection}/${encodeURIComponent(item.slug)}`;
}

export default function LocalStorageList({
  kind,
}: {
  kind: 'wishlist' | 'recent';
}) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadLocal = () => {
      if (cancelled) return;
      setItems(localItems(localStorage.getItem(`ume-${kind}`)));
    };

    if (kind === 'wishlist' && localStorage.getItem('ume_token')) {
      apiFetch<ListItem[]>('/wishlist')
        .then((response) => {
          if (!cancelled) setItems(response.data || []);
        })
        .catch(loadLocal)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      loadLocal();
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (loading) {
    return <div className="p-10 text-center text-sm text-black/40">Loading…</div>;
  }

  if (!items.length) {
    return (
      <div className="border border-dashed border-black/15 p-10 text-center text-sm text-black/50">
        Nothing saved yet. Explore a journey and save it here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id || `${item.itemType}-${item.slug}-${index}`}
          className="flex items-center justify-between border-b border-black/10 py-4"
        >
          <span className="font-serif text-xl">
            {item.item?.title || item.item?.name || item.slug}
          </span>

          <Link href={itemHref(item)} className="text-sm">
            Open →
          </Link>
        </div>
      ))}
    </div>
  );
}
