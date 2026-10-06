'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiList } from '../../lib/api';

type Tour = {
  slug: string;
  title: string;
  duration?: string;
  destinations?: string[];
  hotel?: string;
  transport?: string;
  price?: number;
  difficulty?: string;
  ideal?: string;
};

const rows: Array<[string, keyof Tour]> = [
  ['Duration', 'duration'],
  ['Destinations', 'destinations'],
  ['Hotel', 'hotel'],
  ['Transport', 'transport'],
  ['Price', 'price'],
  ['Difficulty', 'difficulty'],
  ['Ideal traveller', 'ideal'],
];

export default function Compare() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiList<Tour>('/tours?limit=100')
      .then((items) => {
        if (cancelled) return;
        setTours(items);
        setSelected(items.slice(0, 2).map((item) => item.slug));
      })
      .catch(() => {
        if (!cancelled) setError('Tours could not be loaded right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const chosen = useMemo(() => tours.filter((tour) => selected.includes(tour.slug)), [selected, tours]);

  const toggle = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      return current.length < 3 ? [...current, slug] : current;
    });
  };

  const formatValue = (tour: Tour, key: keyof Tour) => {
    const value = tour[key];
    if (key === 'price') return typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : 'To be confirmed';
    if (key === 'destinations') return Array.isArray(value) && value.length ? value.join(' · ') : 'To be confirmed';
    return value ? String(value) : 'To be confirmed';
  };

  if (loading) return <div className="rounded-2xl border border-[#ece7e2] bg-white p-8 text-sm text-black/45">Loading tours…</div>;
  if (error) return <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-sm text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {tours.map((tour) => {
          const active = selected.includes(tour.slug);
          return (
            <button
              key={tour.slug}
              type="button"
              onClick={() => toggle(tour.slug)}
              className={`rounded-full border px-4 py-2.5 text-sm transition ${
                active
                  ? 'border-[#b76b43] bg-[#fff7f2] text-[#a35b36] shadow-sm'
                  : 'border-[#e8e2dc] bg-white text-black/60 hover:border-[#b76b43]/40 hover:text-[#a35b36]'
              }`}
            >
              {tour.title}
            </button>
          );
        })}
      </div>

      {chosen.length ? (
        <div className="overflow-x-auto rounded-[22px] border border-[#eae4de] bg-white shadow-[0_8px_30px_rgba(27,25,23,0.04)]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <tbody>
              {rows.map(([label, key]) => (
                <tr key={label} className="border-b border-[#eee9e4] last:border-b-0">
                  <th className="w-44 bg-[#fdfbf9] p-4 text-xs font-semibold uppercase tracking-wider text-black/40">{label}</th>
                  {chosen.map((tour) => (
                    <td key={tour.slug} className="p-4 align-top text-black/65">{formatValue(tour, key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ece7e2] bg-white p-8 text-sm text-black/45">Select up to three tours to compare.</div>
      )}
    </div>
  );
}
