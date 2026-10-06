'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { apiList } from '../../lib/api';

type Item = {
  slug: string;
  name?: string;
  title?: string;
  location?: string;
  date?: string;
};

type SearchResult = [string, string];
type Group = [string | undefined, SearchResult[], string];

export type SearchBoxLabels = {
  placeholder?: string;
  submitLabel?: string;
  loadingLabel?: string;
  resultsHeading?: string;
  resultSingular?: string;
  resultPlural?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  errorMessage?: string;
  destinationsLabel?: string;
  toursLabel?: string;
  experiencesLabel?: string;
  storiesLabel?: string;
  eventsLabel?: string;
};

export default function SearchBox({
  initialQuery = '',
  labels = {},
}: {
  initialQuery?: string;
  labels?: SearchBoxLabels;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const term = q.trim();

    if (!term) {
      setGroups([]);
      setLoading(false);
      setSearched(false);
      setFailed(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);

      try {
        const [destinations, tours, experiences, stories, events] = await Promise.all([
          apiList<Item>(`/destinations?q=${encodeURIComponent(term)}&limit=8`),
          apiList<Item>(`/tours?q=${encodeURIComponent(term)}&limit=8`),
          apiList<Item>(`/experiences?q=${encodeURIComponent(term)}&limit=8`),
          apiList<Item>(`/stories?q=${encodeURIComponent(term)}&limit=8`),
          apiList<Item>(`/events?q=${encodeURIComponent(term)}&limit=8`),
        ]);

        if (cancelled) return;

        const makeResults = (items: Item[], basePath: string): SearchResult[] =>
          items
            .filter((item) => item.slug && (item.name || item.title))
            .map((item) => [String(item.name || item.title), `${basePath}/${item.slug}`]);

        const next: Group[] = [
          [labels.destinationsLabel, makeResults(destinations, '/destinations'), 'destinations'],
          [labels.toursLabel, makeResults(tours, '/tours'), 'tours'],
          [labels.experiencesLabel, makeResults(experiences, '/experiences'), 'experiences'],
          [labels.storiesLabel, makeResults(stories, '/stories'), 'stories'],
          [labels.eventsLabel, makeResults(events, '/events'), 'events'],
        ];

        setGroups(next.filter(([, items]) => items.length > 0));
        setSearched(true);
      } catch (searchError) {
        if (cancelled) return;
        console.error('Search request failed:', searchError);
        setGroups([]);
        setSearched(true);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, labels.destinationsLabel, labels.toursLabel, labels.experiencesLabel, labels.storiesLabel, labels.eventsLabel]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setQ('');
    setGroups([]);
    setSearched(false);
    setFailed(false);
    router.replace('/search');
  };

  const totalResults = groups.reduce((total, [, items]) => total + items.length, 0);
  const resultWord = totalResults === 1 ? labels.resultSingular : labels.resultPlural;

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:border sm:border-[#ded6ce] sm:bg-white sm:p-1.5 sm:shadow-[0_14px_45px_rgba(27,25,23,0.07)] sm:focus-within:border-[#b76b43]/55">
        <div className="relative flex min-h-[58px] min-w-0 flex-1 items-center rounded-[18px] border border-[#ded6ce] bg-white shadow-[0_8px_25px_rgba(27,25,23,0.04)] focus-within:border-[#b76b43] sm:min-h-[54px] sm:rounded-full sm:border-0 sm:shadow-none">
          <span className="pointer-events-none absolute left-3 grid h-10 w-10 place-items-center rounded-full bg-[#faf6f1] text-[#b76b43] sm:left-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} strokeWidth={1.8} />}
          </span>

          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="min-h-[58px] w-full min-w-0 appearance-none rounded-[18px] border-0 bg-transparent py-3 pl-[62px] pr-12 font-serif text-lg text-[#1b1917] shadow-none outline-none placeholder:font-sans placeholder:text-[13px] placeholder:font-normal placeholder:text-[#1b1917]/35 focus:border-0 focus:shadow-none sm:min-h-[54px] sm:rounded-full sm:pl-[60px] sm:text-xl [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />

          {q.length > 0 ? (
            <button type="button" onClick={handleClear} aria-label="Clear search" className="absolute right-3 grid h-8 w-8 place-items-center rounded-full text-[#1b1917]/35 transition hover:bg-[#f1ebe5] hover:text-[#1b1917]">
              <X size={15} />
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!q.trim()}
          aria-label={labels.submitLabel ? undefined : 'Search'}
          className="group inline-flex min-h-[56px] shrink-0 items-center justify-center gap-2.5 rounded-[18px] bg-[#b76b43] px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-[0_10px_28px_rgba(183,107,67,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#9c5735] disabled:pointer-events-none disabled:opacity-40 sm:min-h-[48px] sm:rounded-full sm:px-7"
        >
          {labels.submitLabel && <span>{labels.submitLabel}</span>}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {q.trim() ? (
        <div className="mt-4 overflow-hidden rounded-[24px] border border-[#e6ded6] bg-white shadow-[0_18px_55px_rgba(27,25,23,0.09)]">
          {loading ? (
            <div className="flex items-center gap-3 px-5 py-5 text-sm text-[#1b1917]/45">
              <Loader2 size={16} className="animate-spin text-[#b76b43]" />
              {labels.loadingLabel && (
                <>
                  {labels.loadingLabel} <span className="font-medium text-[#1b1917]/70">“{q.trim()}”</span>
                </>
              )}
            </div>
          ) : null}

          {!loading && failed && labels.errorMessage ? (
            <div className="px-5 py-5 text-sm leading-6 text-red-600">{labels.errorMessage}</div>
          ) : null}

          {!loading && !failed && groups.length > 0 ? (
            <>
              {(labels.resultsHeading || resultWord) && (
                <div className="flex items-center justify-between gap-4 border-b border-[#eee7e0] bg-[#fdfbf9] px-5 py-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a35b36]">{labels.resultsHeading}</p>
                  {resultWord && (
                    <span className="text-[10px] font-medium text-[#1b1917]/35">
                      {totalResults} {resultWord}
                    </span>
                  )}
                </div>
              )}

              <div className="max-h-[480px] overflow-y-auto">
                {groups.map(([name, items, id]) => (
                  <div key={id} className="border-b border-[#eee7e0] px-5 py-5 last:border-b-0">
                    {name && (
                      <div className="mb-2 flex items-center gap-2.5">
                        <span className="h-px w-5 bg-[#b76b43]" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a35b36]">{name}</p>
                      </div>
                    )}
                    <div>
                      {items.map(([label, href]) => (
                        <Link key={`${id}-${href}`} href={href} className="group flex items-center justify-between gap-5 rounded-xl px-3 py-3 transition hover:bg-[#faf7f3]">
                          <span className="min-w-0 truncate font-serif text-lg text-[#1b1917] transition-colors group-hover:text-[#a35b36] sm:text-xl">{label}</span>
                          <ArrowRight size={15} className="shrink-0 text-[#1b1917]/25 transition-all group-hover:translate-x-1 group-hover:text-[#b76b43]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {!loading && !failed && searched && groups.length === 0 && (labels.emptyTitle || labels.emptyMessage) ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#faf6f1] text-[#b76b43]"><Search size={17} /></div>
              {labels.emptyTitle && <p className="mt-4 font-serif text-xl text-[#1b1917]">{labels.emptyTitle}</p>}
              {labels.emptyMessage && <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#1b1917]/40">{labels.emptyMessage}</p>}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
