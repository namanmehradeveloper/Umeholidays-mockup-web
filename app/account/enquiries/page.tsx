'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { apiFetch } from '../../../lib/api';

type Enquiry = {
  _id: string;
  destination?: string;
  status?: string;
  travelDates?: string;
  createdAt?: string;
};

export default function EnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiFetch<Enquiry[]>('/enquiries/me')
      .then((result) => {
        if (!cancelled) setItems(Array.isArray(result.data) ? result.data : []);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setItems([]);
        setError(requestError instanceof Error ? requestError.message : 'Enquiries could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-36 text-[#1b1917]">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a35b36]">Your requests</p>
        <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">My enquiries</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">Track the travel requests you have shared with the UME Holidays team.</p>

        {error ? <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="mt-8 space-y-3">
          {loading ? <div className="rounded-2xl border border-[#ece7e2] bg-white p-8 text-sm text-black/45">Loading enquiries…</div> : null}

          {!loading && !error
            ? items.map((item) => (
                <article key={item._id} className="rounded-[22px] border border-[#ece7e2] bg-white p-5 shadow-[0_7px_26px_rgba(27,25,23,0.035)]">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-serif text-xl">{item.destination?.trim() || 'Custom trip'}</h2>
                      <p className="mt-2 text-sm text-black/45">{item.travelDates?.trim() || 'Dates to confirm'}</p>
                    </div>
                    <span className="w-fit rounded-full border border-[#eadfd6] bg-[#fff9f5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a35b36]">
                      {item.status || 'new'}
                    </span>
                  </div>
                </article>
              ))
            : null}

          {!loading && !error && !items.length ? (
            <div className="rounded-[22px] border border-dashed border-[#ddd5ce] bg-white p-10 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#faf6f2] text-[#b76b43]"><Mail size={17} /></div>
              <p className="mt-4 font-serif text-xl">No enquiries yet.</p>
              <p className="mt-1 text-sm text-black/40">New trip requests will appear here.</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
