'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type ItemType =
  | 'tour'
  | 'destination'
  | 'experience'
  | 'event'
  | 'story';

type Props = {
  slug: string;
  itemType?: ItemType;
};

function readLocalWishlist(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem('ume-wishlist') || '[]'
    );

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    // Recover from malformed/stale browser storage instead of making the
    // wishlist button permanently unusable.
    localStorage.removeItem('ume-wishlist');
    return [];
  }
}

export default function SaveButton({
  slug,
  itemType = 'tour',
}: Props) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ume_token');

    if (token) {
      apiFetch<any>('/wishlist')
        .then((response) => {
          const items = response?.data || [];

          setSaved(
            items.some(
              (item: any) =>
                item.itemType === itemType &&
                item.slug === slug
            )
          );
        })
        .catch(() => {});
    } else {
      try {
        const list = readLocalWishlist();

        setSaved(
          list.includes(`${itemType}:${slug}`) ||
          list.includes(slug)
        );
      } catch {
        setSaved(false);
      }
    }
  }, [slug, itemType]);

  const toggle = async () => {
    if (busy) return;

    const token = localStorage.getItem('ume_token');

    setBusy(true);

    try {
      if (token) {
        if (saved) {
          await apiFetch(
            `/wishlist/${itemType}/${encodeURIComponent(slug)}`,
            {
              method: 'DELETE',
            }
          );
        } else {
          await apiFetch('/wishlist', {
            method: 'POST',
            body: JSON.stringify({
              itemType,
              slug,
            }),
          });
        }
      } else {
        const list = readLocalWishlist();

        const key = `${itemType}:${slug}`;

        const next = saved
          ? list.filter(
              (item) =>
                item !== key &&
                item !== slug
            )
          : [
              ...list.filter(
                (item) =>
                  item !== key &&
                  item !== slug
              ),
              key,
            ].slice(-50);

        localStorage.setItem(
          'ume-wishlist',
          JSON.stringify(next)
        );
      }

      setSaved((value) => !value);
    } catch (error: any) {
      window.alert(
        error?.message ||
          'Please sign in and try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      aria-label={
        saved
          ? `Remove ${itemType} from wishlist`
          : `Save ${itemType} to wishlist`
      }
      className="
        group
        mt-3
        flex
        w-full
        items-center
        justify-center
        gap-2
        border
        border-black/[0.12]
        bg-white
        px-5
        py-3
        text-sm
        font-medium
        text-[#1b1917]
        transition-all
        duration-300
        hover:border-[#b76b43]
        hover:text-[#a35b36]
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <Heart
        size={16}
        strokeWidth={1.8}
        className={`transition-all duration-300 ${
          saved
            ? 'fill-[#b76b43] text-[#b76b43]'
            : 'group-hover:text-[#b76b43]'
        }`}
      />

      <span>
        {busy
          ? 'Saving…'
          : saved
          ? `Saved ${itemType}`
          : `Save ${itemType}`}
      </span>
    </button>
  );
}